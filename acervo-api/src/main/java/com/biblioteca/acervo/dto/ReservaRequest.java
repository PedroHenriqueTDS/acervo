package com.biblioteca.acervo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
public class ReservaRequest {

    @NotNull(message = "O ID do livro é obrigatório")
    private UUID livroId;
}
