package com.biblioteca.acervo.controller;

import com.biblioteca.acervo.dto.EmprestimoRequest;
import com.biblioteca.acervo.dto.EmprestimoResponse;
import com.biblioteca.acervo.service.EmprestimoService;
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
@RequestMapping("/api/v1/emprestimos")
@Tag(name = "Empréstimos", description = "Endpoints para solicitação, devolução e acompanhamento de empréstimos")
@SecurityRequirement(name = "bearerAuth")
public class EmprestimoController {

    private final EmprestimoService emprestimoService;

    public EmprestimoController(EmprestimoService emprestimoService) {
        this.emprestimoService = emprestimoService;
    }

    @PostMapping
    @Operation(summary = "Solicitar empréstimo de um livro", description = "Registra um novo empréstimo ativo para o usuário autenticado. O livro solicitado deve estar disponível em estoque.")
    public ResponseEntity<EmprestimoResponse> solicitarEmprestimo(
            @Valid @RequestBody EmprestimoRequest request, 
            Principal principal) {
        EmprestimoResponse response = emprestimoService.solicitarEmprestimo(principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/devolver")
    @Operation(summary = "Registrar devolução de livro", description = "Registra a entrega do livro, calcula multas se atrasado e devolve o exemplar ao estoque. Acesso apenas para administradores (BIBLIOTECARIO).")
    public ResponseEntity<EmprestimoResponse> registrarDevolucao(@PathVariable("id") UUID id) {
        EmprestimoResponse response = emprestimoService.registrarDevolucao(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/meus")
    @Operation(summary = "Listar meus empréstimos", description = "Retorna o histórico completo de empréstimos solicitados pelo usuário leitor autenticado.")
    public ResponseEntity<List<EmprestimoResponse>> listarMeusEmprestimos(Principal principal) {
        List<EmprestimoResponse> response = emprestimoService.listarMeusEmprestimos(principal.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Listar todos os empréstimos", description = "Retorna todos os empréstimos cadastrados no sistema. Acesso apenas para administradores (BIBLIOTECARIO).")
    public ResponseEntity<List<EmprestimoResponse>> listarTodos() {
        List<EmprestimoResponse> response = emprestimoService.listarTodos();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/atrasados")
    @Operation(summary = "Listar empréstimos em atraso", description = "Retorna todos os empréstimos que ultrapassaram a data prevista de devolução e constam como ATIVOS. Acesso apenas para administradores (BIBLIOTECARIO).")
    public ResponseEntity<List<EmprestimoResponse>> listarAtrasados() {
        List<EmprestimoResponse> response = emprestimoService.listarAtrasados();
        return ResponseEntity.ok(response);
    }
}
