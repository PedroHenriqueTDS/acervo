package com.biblioteca.acervo.service;

import com.biblioteca.acervo.dto.EmprestimoRequest;
import com.biblioteca.acervo.dto.EmprestimoResponse;
import com.biblioteca.acervo.dto.LivroResponse;
import com.biblioteca.acervo.dto.UsuarioResponse;
import com.biblioteca.acervo.exception.RecursoNaoEncontradoException;
import com.biblioteca.acervo.exception.RegraNegocioException;
import com.biblioteca.acervo.model.Emprestimo;
import com.biblioteca.acervo.model.Livro;
import com.biblioteca.acervo.model.StatusEmprestimo;
import com.biblioteca.acervo.model.StatusReserva;
import com.biblioteca.acervo.model.Reserva;
import com.biblioteca.acervo.model.Usuario;
import com.biblioteca.acervo.repository.EmprestimoRepository;
import com.biblioteca.acervo.repository.LivroRepository;
import com.biblioteca.acervo.repository.ReservaRepository;
import com.biblioteca.acervo.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class EmprestimoService {

    private final EmprestimoRepository emprestimoRepository;
    private final LivroRepository livroRepository;
    private final UsuarioRepository usuarioRepository;
    private final ReservaRepository reservaRepository;
    private final EmailService emailService;

    public EmprestimoService(
            EmprestimoRepository emprestimoRepository,
            LivroRepository livroRepository,
            UsuarioRepository usuarioRepository,
            ReservaRepository reservaRepository,
            EmailService emailService) {
        this.emprestimoRepository = emprestimoRepository;
        this.livroRepository = livroRepository;
        this.usuarioRepository = usuarioRepository;
        this.reservaRepository = reservaRepository;
        this.emailService = emailService;
    }

    @Transactional
    public EmprestimoResponse solicitarEmprestimo(String emailUsuario, EmprestimoRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado com o e-mail: " + emailUsuario));

        // RNF02: Trata concorrência buscando o livro com Lock pessimista de gravação no banco
        Livro livro = livroRepository.findByIdWithLock(request.getLivroId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Livro não encontrado com o ID: " + request.getLivroId()));

        // RN01: Um livro só pode ser emprestado se quantidadeDisponivel > 0
        if (livro.getQuantidadeDisponivel() <= 0) {
            throw new RegraNegocioException("Não existem exemplares disponíveis deste livro no momento. Você pode realizar uma reserva.");
        }

        // RN04: Um usuário não pode ter mais de 3 empréstimos ativos simultaneamente (ATIVO ou ATRASADO)
        long emprestimosAtivos = emprestimoRepository.countByUsuarioEmailAndStatusIn(
                emailUsuario, 
                Arrays.asList(StatusEmprestimo.ATIVO, StatusEmprestimo.ATRASADO)
        );
        if (emprestimosAtivos >= 3) {
            throw new RegraNegocioException("Você já possui o limite de 3 empréstimos ativos simultaneamente.");
        }

        // RN05: Um usuário com multa pendente não pode realizar novos empréstimos
        boolean temMultas = emprestimoRepository.possuiMultaPendente(
                usuario.getId(), 
                Arrays.asList(StatusEmprestimo.ATIVO, StatusEmprestimo.ATRASADO), 
                BigDecimal.ZERO
        );
        if (temMultas) {
            throw new RegraNegocioException("Você possui multas pendentes por atraso. Regularize sua situação para realizar novos empréstimos.");
        }

        // Registra o empréstimo
        Emprestimo emprestimo = Emprestimo.builder()
                .usuario(usuario)
                .livro(livro)
                .status(StatusEmprestimo.ATIVO)
                .valorMulta(BigDecimal.ZERO)
                .build();

        // Decrementa estoque disponível do livro
        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
        livroRepository.save(livro);

        Emprestimo emprestimoSalvo = emprestimoRepository.save(emprestimo);
        
        // RF21: Envia e-mail de confirmação de empréstimo
        emailService.enviarConfirmacaoEmprestimo(
                usuario.getEmail(), 
                usuario.getNome(), 
                livro.getTitulo(), 
                emprestimoSalvo.getDataPrevistaDevolucao()
        );

        return mapearParaResponse(emprestimoSalvo);
    }

    @Transactional
    public EmprestimoResponse registrarDevolucao(UUID id) {
        Emprestimo emprestimo = emprestimoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Empréstimo não encontrado com o ID: " + id));

        if (emprestimo.getStatus() == StatusEmprestimo.DEVOLVIDO) {
            throw new RegraNegocioException("Este empréstimo já consta como devolvido.");
        }

        LocalDateTime agora = LocalDateTime.now();
        emprestimo.setDataDevolucaoReal(agora);
        emprestimo.setStatus(StatusEmprestimo.DEVOLVIDO);

        // RN03: Multa por atraso de R$ 1,00 por dia de atraso, a partir do 1º dia após o vencimento
        if (agora.isAfter(emprestimo.getDataPrevistaDevolucao())) {
            long diasAtraso = ChronoUnit.DAYS.between(emprestimo.getDataPrevistaDevolucao().toLocalDate(), agora.toLocalDate());
            if (diasAtraso > 0) {
                emprestimo.setValorMulta(BigDecimal.valueOf(diasAtraso * 1.00));
            }
        }

        // Restaura estoque disponível ou gerencia fila de reserva (RN06 / RF19)
        Livro livro = emprestimo.getLivro();
        java.util.Optional<Reserva> nextReservaOpt = reservaRepository.findFirstByLivroIdAndStatusOrderByPosicaoFilaAsc(livro.getId(), StatusReserva.AGUARDANDO);

        if (nextReservaOpt.isPresent()) {
            Reserva nextReserva = nextReservaOpt.get();
            nextReserva.setStatus(StatusReserva.NOTIFICADO);
            nextReserva.setDataNotificacao(agora);
            reservaRepository.save(nextReserva);

            // RF19: Ao ocorrer devolução, notifica automaticamente por e-mail o próximo da fila
            emailService.enviarNotificacaoReservaPronta(
                    nextReserva.getUsuario().getEmail(), 
                    nextReserva.getUsuario().getNome(), 
                    livro.getTitulo()
            );

            // Reordena o restante da fila de espera
            List<Reserva> filaRestante = reservaRepository.findByLivroIdAndStatusOrderByPosicaoFilaAsc(livro.getId(), StatusReserva.AGUARDANDO);
            int novaPosicao = 1;
            for (Reserva r : filaRestante) {
                r.setPosicaoFila(novaPosicao++);
                reservaRepository.save(r);
            }
            // Não incrementamos a quantidadeDisponivel, pois o exemplar é retido para o usuário notificado!
        } else {
            livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() + 1);
            livroRepository.save(livro);
        }

        Emprestimo devolvido = emprestimoRepository.save(emprestimo);

        return mapearParaResponse(devolvido);
    }

    @Transactional(readOnly = true)
    public List<EmprestimoResponse> listarMeusEmprestimos(String emailUsuario) {
        return emprestimoRepository.findByUsuarioEmailOrderByDataEmprestimoDesc(emailUsuario).stream()
                .map(this::mapearParaResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmprestimoResponse> listarTodos() {
        return emprestimoRepository.findAll().stream()
                .map(this::mapearParaResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmprestimoResponse> listarAtrasados() {
        return emprestimoRepository.findByStatusOrderByDataEmprestimoDesc(StatusEmprestimo.ATRASADO).stream()
                .map(this::mapearParaResponse)
                .collect(Collectors.toList());
    }

    private EmprestimoResponse mapearParaResponse(Emprestimo emprestimo) {
        Usuario usuario = emprestimo.getUsuario();
        Livro livro = emprestimo.getLivro();

        UsuarioResponse userDto = UsuarioResponse.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .papel(usuario.getPapel())
                .dataCadastro(usuario.getDataCadastro())
                .build();

        LivroResponse bookDto = LivroResponse.builder()
                .id(livro.getId())
                .titulo(livro.getTitulo())
                .autor(livro.getAutor())
                .isbn(livro.getIsbn())
                .categoria(livro.getCategoria())
                .quantidadeTotal(livro.getQuantidadeTotal())
                .quantidadeDisponivel(livro.getQuantidadeDisponivel())
                .dataCadastro(livro.getDataCadastro())
                .build();

        return EmprestimoResponse.builder()
                .id(emprestimo.getId())
                .usuario(userDto)
                .livro(bookDto)
                .dataEmprestimo(emprestimo.getDataEmprestimo())
                .dataPrevistaDevolucao(emprestimo.getDataPrevistaDevolucao())
                .dataDevolucaoReal(emprestimo.getDataDevolucaoReal())
                .status(emprestimo.getStatus())
                .valorMulta(emprestimo.getValorMulta())
                .build();
    }
}
