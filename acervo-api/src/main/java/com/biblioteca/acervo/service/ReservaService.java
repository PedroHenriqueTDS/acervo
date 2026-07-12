package com.biblioteca.acervo.service;

import com.biblioteca.acervo.dto.EmprestimoResponse;
import com.biblioteca.acervo.dto.LivroResponse;
import com.biblioteca.acervo.dto.ReservaRequest;
import com.biblioteca.acervo.dto.ReservaResponse;
import com.biblioteca.acervo.dto.UsuarioResponse;
import com.biblioteca.acervo.exception.RecursoNaoEncontradoException;
import com.biblioteca.acervo.exception.RegraNegocioException;
import com.biblioteca.acervo.model.*;
import com.biblioteca.acervo.repository.EmprestimoRepository;
import com.biblioteca.acervo.repository.LivroRepository;
import com.biblioteca.acervo.repository.ReservaRepository;
import com.biblioteca.acervo.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final LivroRepository livroRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmprestimoRepository emprestimoRepository;

    public ReservaService(
            ReservaRepository reservaRepository,
            LivroRepository livroRepository,
            UsuarioRepository usuarioRepository,
            EmprestimoRepository emprestimoRepository) {
        this.reservaRepository = reservaRepository;
        this.livroRepository = livroRepository;
        this.usuarioRepository = usuarioRepository;
        this.emprestimoRepository = emprestimoRepository;
    }

    @Transactional
    public ReservaResponse solicitarReserva(String emailUsuario, ReservaRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado com o e-mail: " + emailUsuario));

        Livro livro = livroRepository.findById(request.getLivroId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Livro não encontrado com o ID: " + request.getLivroId()));

        // RN01: Se houver exemplar disponível, deve fazer o empréstimo e não a reserva
        if (livro.getQuantidadeDisponivel() > 0) {
            throw new RegraNegocioException("Existem exemplares disponíveis deste livro no momento. Realize o empréstimo diretamente.");
        }

        // Evita duplicidade de reserva ativa ou notificada para o mesmo livro pelo mesmo usuário
        boolean jaReservado = reservaRepository.existsByUsuarioIdAndLivroIdAndStatusIn(
                usuario.getId(), 
                livro.getId(), 
                Arrays.asList(StatusReserva.AGUARDANDO, StatusReserva.NOTIFICADO)
        );
        if (jaReservado) {
            throw new RegraNegocioException("Você já está na fila de reservas ou aguardando confirmação para este livro.");
        }

        // Calcula a posição na fila (apenas reservas AGUARDANDO no momento)
        long totalNaFila = reservaRepository.countByLivroIdAndStatus(livro.getId(), StatusReserva.AGUARDANDO);
        int posicaoFila = (int) totalNaFila + 1;

        Reserva reserva = Reserva.builder()
                .usuario(usuario)
                .livro(livro)
                .posicaoFila(posicaoFila)
                .status(StatusReserva.AGUARDANDO)
                .build();

        Reserva salva = reservaRepository.save(reserva);
        return mapearParaResponse(salva);
    }

    @Transactional
    public EmprestimoResponse confirmarReserva(UUID reservaId, String emailUsuario) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Reserva não encontrada com o ID: " + reservaId));

        if (!reserva.getUsuario().getEmail().equals(emailUsuario)) {
            throw new RegraNegocioException("Você não tem permissão para confirmar esta reserva.");
        }

        if (reserva.getStatus() != StatusReserva.NOTIFICADO) {
            throw new RegraNegocioException("Esta reserva não está pronta para confirmação ou já expirou/foi concluída.");
        }

        // Valida se o usuário não ultrapassa o limite de empréstimos
        long emprestimosAtivos = emprestimoRepository.countByUsuarioEmailAndStatusIn(
                emailUsuario, 
                Arrays.asList(StatusEmprestimo.ATIVO, StatusEmprestimo.ATRASADO)
        );
        if (emprestimosAtivos >= 3) {
            throw new RegraNegocioException("Você já possui o limite de 3 empréstimos ativos simultaneamente. Devolva um livro antes de confirmar a reserva.");
        }

        // Conclui a reserva
        reserva.setStatus(StatusReserva.CONCLUIDA);
        reservaRepository.save(reserva);

        // Cria o empréstimo. Note que a quantidadeDisponivel do livro não é decrementada aqui
        // pois ela não foi incrementada na devolução (a cópia já estava reservada e retida).
        Emprestimo emprestimo = Emprestimo.builder()
                .usuario(reserva.getUsuario())
                .livro(reserva.getLivro())
                .status(StatusEmprestimo.ATIVO)
                .valorMulta(BigDecimal.ZERO)
                .build();

        Emprestimo salvo = emprestimoRepository.save(emprestimo);

        // Retorna o empréstimo correspondente
        return mapearParaEmprestimoResponse(salvo);
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> listarMinhasReservas(String emailUsuario) {
        return reservaRepository.findByUsuarioEmailOrderByDataReservaDesc(emailUsuario).stream()
                .map(this::mapearParaResponse)
                .collect(Collectors.toList());
    }

    private ReservaResponse mapearParaResponse(Reserva reserva) {
        Usuario usuario = reserva.getUsuario();
        Livro livro = reserva.getLivro();

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

        return ReservaResponse.builder()
                .id(reserva.getId())
                .usuario(userDto)
                .livro(bookDto)
                .dataReserva(reserva.getDataReserva())
                .posicaoFila(reserva.getPosicaoFila())
                .status(reserva.getStatus())
                .dataNotificacao(reserva.getDataNotificacao())
                .build();
    }

    private EmprestimoResponse mapearParaEmprestimoResponse(Emprestimo emprestimo) {
        Usuario usuario = emprestimo.getUsuario();
        Livro livro = emprestimo.getLivro();

        UsuarioResponse userDto = UsuarioResponse.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .papel(usuario.getPapel())
                .build();

        LivroResponse bookDto = LivroResponse.builder()
                .id(livro.getId())
                .titulo(livro.getTitulo())
                .autor(livro.getAutor())
                .isbn(livro.getIsbn())
                .categoria(livro.getCategoria())
                .quantidadeTotal(livro.getQuantidadeTotal())
                .quantidadeDisponivel(livro.getQuantidadeDisponivel())
                .build();

        return EmprestimoResponse.builder()
                .id(emprestimo.getId())
                .usuario(userDto)
                .livro(bookDto)
                .dataEmprestimo(emprestimo.getDataEmprestimo())
                .dataPrevistaDevolucao(emprestimo.getDataPrevistaDevolucao())
                .status(emprestimo.getStatus())
                .valorMulta(emprestimo.getValorMulta())
                .build();
    }
}
