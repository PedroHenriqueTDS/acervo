package com.biblioteca.acervo.controller;

import com.biblioteca.acervo.dto.EmprestimoResponse;
import com.biblioteca.acervo.dto.ReservaRequest;
import com.biblioteca.acervo.dto.ReservaResponse;
import com.biblioteca.acervo.service.ReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reservas")
@Tag(name = "Reservas", description = "Endpoints para solicitação, consulta e confirmação de reservas de livros indisponíveis")
@SecurityRequirement(name = "bearerAuth")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @PostMapping
    @Operation(summary = "Solicitar reserva de livro esgotado", description = "Insere o usuário leitor logado na fila de espera para um livro que não possui cópias disponíveis em estoque.")
    public ResponseEntity<ReservaResponse> solicitarReserva(
            @Valid @RequestBody ReservaRequest request, 
            Principal principal) {
        ReservaResponse response = reservaService.solicitarReserva(principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/confirmar")
    @Operation(summary = "Confirmar reserva notificada", description = "Converte a reserva do status NOTIFICADO em um empréstimo ativo no sistema (dentro do prazo de 48h).")
    public ResponseEntity<EmprestimoResponse> confirmarReserva(
            @PathVariable("id") UUID id, 
            Principal principal) {
        EmprestimoResponse response = reservaService.confirmarReserva(id, principal.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/minhas")
    @Operation(summary = "Listar minhas reservas", description = "Retorna a lista completa das reservas solicitadas pelo leitor logado e suas respectivas posições na fila.")
    public ResponseEntity<List<ReservaResponse>> listarMinhasReservas(Principal principal) {
        List<ReservaResponse> response = reservaService.listarMinhasReservas(principal.getName());
        return ResponseEntity.ok(response);
    }
}
