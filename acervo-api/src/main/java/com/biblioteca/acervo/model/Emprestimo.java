package com.biblioteca.acervo.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "emprestimo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Emprestimo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "livro_id", nullable = false)
    private Livro livro;

    @Column(name = "data_emprestimo", nullable = false, updatable = false)
    private LocalDateTime dataEmprestimo;

    @Column(name = "data_prevista_devolucao", nullable = false)
    private LocalDateTime dataPrevistaDevolucao;

    @Column(name = "data_devolucao_real")
    private LocalDateTime dataDevolucaoReal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusEmprestimo status;

    @Column(name = "valor_multa", nullable = false)
    private BigDecimal valorMulta;

    @PrePersist
    protected void onCreate() {
        if (this.dataEmprestimo == null) {
            this.dataEmprestimo = LocalDateTime.now();
        }
        if (this.dataPrevistaDevolucao == null) {
            this.dataPrevistaDevolucao = this.dataEmprestimo.plusDays(14); // RN02: 14 dias corridos
        }
        if (this.status == null) {
            this.status = StatusEmprestimo.ATIVO;
        }
        if (this.valorMulta == null) {
            this.valorMulta = BigDecimal.ZERO;
        }
    }
}
