package com.biblioteca.acervo.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;
import java.util.Map;

@Getter
@Builder
public class DashboardStatsResponse {
    private long totalLivrosAcervo;
    private long totalEmprestimosAtivos;
    private long totalEmprestimosAtrasados;
    private long totalReservasAtivas;
    private List<LivroDestaqueDto> livrosMaisEmprestados;
    private Map<String, Long> emprestimosPorCategoria;

    @Getter
    @Builder
    public static class LivroDestaqueDto {
        private String titulo;
        private String autor;
        private long quantidadeEmprestimos;
    }
}
