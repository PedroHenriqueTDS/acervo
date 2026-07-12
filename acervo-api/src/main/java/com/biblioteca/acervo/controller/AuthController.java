package com.biblioteca.acervo.controller;

import com.biblioteca.acervo.dto.CadastroRequest;
import com.biblioteca.acervo.dto.LoginRequest;
import com.biblioteca.acervo.dto.LoginResponse;
import com.biblioteca.acervo.dto.UsuarioResponse;
import com.biblioteca.acervo.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticação", description = "Endpoints para cadastro e autenticação de usuários (Leitores e Bibliotecários)")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Cadastrar um novo usuário", description = "Cria uma conta de leitor ou bibliotecário no sistema. O papel padrão é USUARIO.")
    public ResponseEntity<UsuarioResponse> cadastrar(@Valid @RequestBody CadastroRequest request) {
        UsuarioResponse response = authService.cadastrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Realizar login", description = "Autentica o usuário pelo e-mail e senha, retornando as informações do perfil e o token JWT.")
    public ResponseEntity<LoginResponse> logar(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.logar(request);
        return ResponseEntity.ok(response);
    }
}
