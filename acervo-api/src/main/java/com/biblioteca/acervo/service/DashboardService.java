package com.biblioteca.acervo.service;

import com.biblioteca.acervo.dto.DashboardStatsResponse;
import com.biblioteca.acervo.model.Livro;
import com.biblioteca.acervo.model.StatusEmprestimo;
import com.biblioteca.acervo.model.StatusReserva;
import com.biblioteca.acervo.repository.EmprestimoRepository;
import com.biblioteca.acervo.repository.LivroRepository;
import com.biblioteca.acervo.repository.ReservaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class DashboardService {

    private final LivroRepository livroRepository;
    private final EmprestimoRepository emprestimoRepository;
    private final ReservaRepository reservaRepository;

    public DashboardService(
            LivroRepository livroRepository,
            EmprestimoRepository emprestimoRepository,
            ReservaRepository reservaRepository) {
        this.livroRepository = livroRepository;
        this.emprestimoRepository = emprestimoRepository;
        this.reservaRepository = reservaRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse obterEstatisticas() {
        // 1. Somatória total de exemplares cadastrados no acervo
        long totalLivros = livroRepository.findAll().stream()
                .mapToLong(Livro::getQuantidadeTotal)
                .sum();

        // 2. Empréstimos ativos (ATIVO ou ATRASADO)
        long totalAtivos = emprestimoRepository.findByStatusInOrderByDataEmprestimoDesc(
                Arrays.asList(StatusEmprestimo.ATIVO, StatusEmprestimo.ATRASADO)
        ).size();

        // 3. Empréstimos em atraso
        long totalAtrasados = emprestimoRepository.findByStatusOrderByDataEmprestimoDesc(StatusEmprestimo.ATRASADO).size();

        // 4. Reservas ativas (AGUARDANDO ou NOTIFICADO)
        long totalReservas = reservaRepository.findAll().stream()
                .filter(r -> r.getStatus() == StatusReserva.AGUARDANDO || r.getStatus() == StatusReserva.NOTIFICADO)
                .count();

        // 5. Livros mais emprestados (top 5)
        List<Object[]> maisEmprestadosRaw = emprestimoRepository.findLivrosMaisEmprestadosRaw(PageRequest.of(0, 5));
        List<DashboardStatsResponse.LivroDestaqueDto> livrosMaisEmprestados = maisEmprestadosRaw.stream()
                .map(arr -> DashboardStatsResponse.LivroDestaqueDto.builder()
                        .titulo((String) arr[0])
                        .autor((String) arr[1])
                        .quantidadeEmprestimos((Long) arr[2])
                        .build())
                .collect(Collectors.toList());

        // 6. Distribuição de empréstimos por categoria
        List<Object[]> porCategoriaRaw = emprestimoRepository.findEmprestimosPorCategoriaRaw();
        Map<String, Long> emprestimosPorCategoria = porCategoriaRaw.stream()
                .collect(Collectors.toMap(
                        arr -> (String) arr[0],
                        arr -> (Long) arr[1],
                        (v1, v2) -> v1,
                        HashMap::new
                ));

        return DashboardStatsResponse.builder()
                .totalLivrosAcervo(totalLivros)
                .totalEmprestimosAtivos(totalAtivos)
                .totalEmprestimosAtrasados(totalAtrasados)
                .totalReservasAtivas(totalReservas)
                .livrosMaisEmprestados(livrosMaisEmprestados)
                .emprestimosPorCategoria(emprestimosPorCategoria)
                .build();
    }
}
