package com.biblioteca.acervo.repository;

import com.biblioteca.acervo.model.Livro;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LivroRepository extends JpaRepository<Livro, UUID> {
    
    boolean existsByIsbn(String isbn);
    
    boolean existsByIsbnAndIdNot(String isbn, UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM Livro l WHERE l.id = :id")
    Optional<Livro> findByIdWithLock(@Param("id") UUID id);

    @Query("SELECT l FROM Livro l WHERE " +
           "(:termo IS NULL OR :termo = '' OR " +
           "LOWER(l.titulo) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(l.autor) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(l.categoria) LIKE LOWER(CONCAT('%', :termo, '%')))")
    List<Livro> pesquisarAcervo(@Param("termo") String termo);
}
