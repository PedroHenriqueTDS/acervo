package com.biblioteca.acervo.dto;

import com.biblioteca.acervo.model.Papel;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class UsuarioResponse {
    private UUID id;
    private String nome;
    private String email;
    private Papel papel;
    private LocalDateTime dataCadastro;
}
