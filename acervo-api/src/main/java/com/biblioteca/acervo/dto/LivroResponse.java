package com.biblioteca.acervo.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class LivroResponse {
    private UUID id;
    private String titulo;
    private String autor;
    private String isbn;
    private String categoria;
    private Integer quantidadeTotal;
    private Integer quantidadeDisponivel;
    private LocalDateTime dataCadastro;
}
