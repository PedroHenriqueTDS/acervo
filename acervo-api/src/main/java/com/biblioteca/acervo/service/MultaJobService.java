package com.biblioteca.acervo.service;

import com.biblioteca.acervo.model.*;
import com.biblioteca.acervo.repository.EmprestimoRepository;
import com.biblioteca.acervo.repository.LivroRepository;
import com.biblioteca.acervo.repository.ReservaRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class MultaJobService {

    private final EmprestimoRepository emprestimoRepository;
    private final ReservaRepository reservaRepository;
    private final LivroRepository livroRepository;
    private final EmailService emailService;

    public MultaJobService(
            EmprestimoRepository emprestimoRepository,
            ReservaRepository reservaRepository,
            LivroRepository livroRepository,
            EmailService emailService) {
        this.emprestimoRepository = emprestimoRepository;
        this.reservaRepository = reservaRepository;
        this.livroRepository = livroRepository;
        this.emailService = emailService;
    }

    // Executa diariamente à 1h da manhã
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void executarRotinaDiaria() {
        processarMultasEAtrasos();
        processarExpiracaoDeReservas();
        processarAvisosDeVencimento();
    }

    @Transactional
    public void processarMultasEAtrasos() {
        LocalDateTime agora = LocalDateTime.now();
        List<Emprestimo> ativos = emprestimoRepository.findByStatusInOrderByDataEmprestimoDesc(
                Arrays.asList(StatusEmprestimo.ATIVO, StatusEmprestimo.ATRASADO)
        );

        for (Emprestimo emp : ativos) {
            if (agora.isAfter(emp.getDataPrevistaDevolucao())) {
                // Atualiza o status se for a primeira vez que entra em atraso
                if (emp.getStatus() == StatusEmprestimo.ATIVO) {
                    emp.setStatus(StatusEmprestimo.ATRASADO);
                }

                // RN03: Multa de R$ 1,00 por dia de atraso
                long diasAtraso = ChronoUnit.DAYS.between(emp.getDataPrevistaDevolucao().toLocalDate(), LocalDate.now());
                if (diasAtraso > 0) {
                    emp.setValorMulta(BigDecimal.valueOf(diasAtraso * 1.00));
                }
                
                emprestimoRepository.save(emp);
                
                // NOTA: Emissão de e-mail de alerta de atraso (RF22) será acoplada na Fase 5
            }
        }
    }

    @Transactional
    public void processarExpiracaoDeReservas() {
        // Reservas NOTIFICADAS há mais de 48 horas
        LocalDateTime limite = LocalDateTime.now().minusHours(48);
        List<Reserva> expiradas = reservaRepository.findByStatusAndDataNotificacaoBefore(StatusReserva.NOTIFICADO, limite);

        for (Reserva res : expiradas) {
            res.setStatus(StatusReserva.EXPIRADA);
            reservaRepository.save(res);

            Livro livro = res.getLivro();

            // Verifica se há um próximo usuário na fila de espera
            Optional<Reserva> proximaReservaOpt = reservaRepository.findFirstByLivroIdAndStatusOrderByPosicaoFilaAsc(
                    livro.getId(), 
                    StatusReserva.AGUARDANDO
            );

            if (proximaReservaOpt.isPresent()) {
                Reserva proximaReserva = proximaReservaOpt.get();
                proximaReserva.setStatus(StatusReserva.NOTIFICADO);
                proximaReserva.setDataNotificacao(LocalDateTime.now());
                reservaRepository.save(proximaReserva);

                // Reordena o restante da fila de espera
                List<Reserva> filaRestante = reservaRepository.findByLivroIdAndStatusOrderByPosicaoFilaAsc(
                        livro.getId(), 
                        StatusReserva.AGUARDANDO
                );
                int novaPosicao = 1;
                for (Reserva r : filaRestante) {
                    r.setPosicaoFila(novaPosicao++);
                    reservaRepository.save(r);
                }
                // O livro permanece retido para o novo usuário notificado (quantidadeDisponivel inalterada)
            } else {
                // Se não há fila de espera, a cópia do livro finalmente retorna para o estoque disponível
                livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() + 1);
                livroRepository.save(livro);
            }
        }
    }

    @Transactional
    public void processarAvisosDeVencimento() {
        // Alerta de vencimento próximo (RF22): e-mail enviado exatamente 2 dias antes do vencimento
        LocalDate dataAlvo = LocalDate.now().plusDays(2);
        List<Emprestimo> ativos = emprestimoRepository.findByStatusOrderByDataEmprestimoDesc(StatusEmprestimo.ATIVO);

        for (Emprestimo emp : ativos) {
            if (emp.getDataPrevistaDevolucao().toLocalDate().equals(dataAlvo)) {
                emailService.enviarAlertaVencimentoProximo(
                        emp.getUsuario().getEmail(), 
                        emp.getUsuario().getNome(), 
                        emp.getLivro().getTitulo(), 
                        emp.getDataPrevistaDevolucao()
                );
            }
        }
    }
}
