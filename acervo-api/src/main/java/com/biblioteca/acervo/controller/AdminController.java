package com.biblioteca.acervo.controller;

import com.biblioteca.acervo.dto.DashboardStatsResponse;
import com.biblioteca.acervo.service.DashboardService;
import com.biblioteca.acervo.service.MultaJobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Utilitários Admin", description = "Endpoints administrativos para automação e controle manual do sistema")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final MultaJobService multaJobService;
    private final DashboardService dashboardService;

    public AdminController(MultaJobService multaJobService, DashboardService dashboardService) {
        this.multaJobService = multaJobService;
        this.dashboardService = dashboardService;
    }

    @PostMapping("/cron-trigger")
    @Operation(summary = "Forçar execução da rotina diária", description = "Executa manualmente os jobs de cálculo de multas de atrasos e expiração de reservas notificadas após 48h. Acesso restrito a administradores (BIBLIOTECARIO).")
    public ResponseEntity<String> forcarRotinaDiaria() {
        multaJobService.executarRotinaDiaria();
        return ResponseEntity.ok("Rotina diária executada com sucesso! Multas atualizadas e reservas expiradas processadas.");
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Obter estatísticas da biblioteca", description = "Retorna um resumo de estoque, empréstimos ativos/atrasados, reservas e ranking de livros mais lidos. Acesso restrito a administradores (BIBLIOTECARIO).")
    public ResponseEntity<DashboardStatsResponse> obterEstatisticas() {
        DashboardStatsResponse response = dashboardService.obterEstatisticas();
        return ResponseEntity.ok(response);
    }
}
