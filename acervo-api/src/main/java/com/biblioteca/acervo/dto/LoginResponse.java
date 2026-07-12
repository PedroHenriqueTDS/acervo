package com.biblioteca.acervo.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    private String token;
    @Builder.Default
    private String tipoToken = "Bearer";
    private UsuarioResponse usuario;
}
