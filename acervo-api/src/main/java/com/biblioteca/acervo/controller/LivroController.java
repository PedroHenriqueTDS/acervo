package com.biblioteca.acervo.controller;

import com.biblioteca.acervo.dto.LivroRequest;
import com.biblioteca.acervo.dto.LivroResponse;
import com.biblioteca.acervo.service.LivroService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/livros")
@Tag(name = "Acervo (Livros)", description = "Endpoints para consulta, cadastro e edição do acervo de livros")
@SecurityRequirement(name = "bearerAuth")
public class LivroController {

    private final LivroService livroService;

    public LivroController(LivroService livroService) {
        this.livroService = livroService;
    }

    @GetMapping
    @Operation(summary = "Listar e buscar livros no acervo", description = "Retorna uma lista contendo os livros cadastrados. Permite filtrar por título, autor ou categoria via query param 'termo'. Acesso livre para qualquer usuário logado.")
    public ResponseEntity<List<LivroResponse>> listar(@RequestParam(value = "termo", required = false) String termo) {
        List<LivroResponse> livros = livroService.listar(termo);
        return ResponseEntity.ok(livros);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter detalhes de um livro", description = "Retorna as informações completas de um livro específico através de seu identificador único UUID. Acesso livre para qualquer usuário logado.")
    public ResponseEntity<LivroResponse> buscarPorId(@PathVariable("id") UUID id) {
        LivroResponse livro = livroService.buscarPorId(id);
        return ResponseEntity.ok(livro);
    }

    @PostMapping
    @Operation(summary = "Cadastrar um novo livro", description = "Insere um novo exemplar no acervo da biblioteca. Apenas acessível por administradores (BIBLIOTECARIO).")
    public ResponseEntity<LivroResponse> criar(@Valid @RequestBody LivroRequest request) {
        LivroResponse response = livroService.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar dados de um livro", description = "Modifica os dados cadastrais e o estoque total de um livro específico. Apenas acessível por administradores (BIBLIOTECARIO).")
    public ResponseEntity<LivroResponse> atualizar(@PathVariable("id") UUID id, @Valid @RequestBody LivroRequest request) {
        LivroResponse response = livroService.atualizar(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir um livro do acervo", description = "Remove permanentemente um exemplar do acervo da biblioteca. Apenas acessível por administradores (BIBLIOTECARIO).")
    public ResponseEntity<Void> deletar(@PathVariable("id") UUID id) {
        livroService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
