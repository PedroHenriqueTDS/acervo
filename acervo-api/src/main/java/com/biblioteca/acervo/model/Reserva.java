package com.biblioteca.acervo.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reserva")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "livro_id", nullable = false)
    private Livro livro;

    @Column(name = "data_reserva", nullable = false, updatable = false)
    private LocalDateTime dataReserva;

    @Column(name = "posicao_fila", nullable = false)
    private Integer posicaoFila;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusReserva status;

    @Column(name = "data_notificacao")
    private LocalDateTime dataNotificacao;

    @PrePersist
    protected void onCreate() {
        if (this.dataReserva == null) {
            this.dataReserva = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = StatusReserva.AGUARDANDO;
        }
    }
}
