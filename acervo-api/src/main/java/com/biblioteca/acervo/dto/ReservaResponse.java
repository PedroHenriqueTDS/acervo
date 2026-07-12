package com.biblioteca.acervo.dto;

import com.biblioteca.acervo.model.StatusReserva;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class ReservaResponse {
    private UUID id;
    private UsuarioResponse usuario;
    private LivroResponse livro;
    private LocalDateTime dataReserva;
    private Integer posicaoFila;
    private StatusReserva status;
    private LocalDateTime dataNotificacao;
}
