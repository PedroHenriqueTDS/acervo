package com.biblioteca.acervo.repository;

import com.biblioteca.acervo.model.Reserva;
import com.biblioteca.acervo.model.StatusReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, UUID> {

    List<Reserva> findByUsuarioEmailOrderByDataReservaDesc(String email);

    List<Reserva> findByLivroIdAndStatusOrderByPosicaoFilaAsc(UUID livroId, StatusReserva status);

    Optional<Reserva> findFirstByLivroIdAndStatusOrderByPosicaoFilaAsc(UUID livroId, StatusReserva status);

    List<Reserva> findByStatusAndDataNotificacaoBefore(StatusReserva status, LocalDateTime date);

    boolean existsByUsuarioIdAndLivroIdAndStatusIn(UUID usuarioId, UUID livroId, List<StatusReserva> statuses);

    long countByLivroIdAndStatus(UUID livroId, StatusReserva status);
}
