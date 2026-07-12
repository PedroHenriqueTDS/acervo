package com.biblioteca.acervo.dto;

import com.biblioteca.acervo.model.StatusEmprestimo;
import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class EmprestimoResponse {
    private UUID id;
    private UsuarioResponse usuario;
    private LivroResponse livro;
    private LocalDateTime dataEmprestimo;
    private LocalDateTime dataPrevistaDevolucao;
    private LocalDateTime dataDevolucaoReal;
    private StatusEmprestimo status;
    private BigDecimal valorMulta;
}
