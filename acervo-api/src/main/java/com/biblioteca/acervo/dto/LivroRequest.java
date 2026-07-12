package com.biblioteca.acervo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LivroRequest {

    @NotBlank(message = "O título é obrigatório")
    private String titulo;

    @NotBlank(message = "O autor é obrigatório")
    private String autor;

    @NotBlank(message = "O ISBN é obrigatório")
    private String isbn;

    @NotBlank(message = "A categoria é obrigatória")
    private String categoria;

    @NotNull(message = "A quantidade total é obrigatória")
    @Min(value = 0, message = "A quantidade total deve ser maior ou igual a zero")
    private Integer quantidadeTotal;
}
