package com.biblioteca.acervo.repository;

import com.biblioteca.acervo.model.Emprestimo;
import com.biblioteca.acervo.model.StatusEmprestimo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmprestimoRepository extends JpaRepository<Emprestimo, UUID> {

    List<Emprestimo> findByUsuarioEmailOrderByDataEmprestimoDesc(String email);

    List<Emprestimo> findByStatusOrderByDataEmprestimoDesc(StatusEmprestimo status);

    List<Emprestimo> findByStatusInOrderByDataEmprestimoDesc(List<StatusEmprestimo> statuses);

    long countByUsuarioEmailAndStatusIn(String email, List<StatusEmprestimo> statuses);

    boolean existsByLivroIdAndStatusIn(UUID livroId, List<StatusEmprestimo> statuses);

    // RN05: Verifica se o usuário tem multas pendentes (> 0) em empréstimos não devolvidos
    @Query("SELECT COUNT(e) > 0 FROM Emprestimo e WHERE e.usuario.id = :usuarioId AND e.status IN :statuses AND e.valorMulta > :zero")
    boolean possuiMultaPendente(
            @Param("usuarioId") UUID usuarioId, 
            @Param("statuses") List<StatusEmprestimo> statuses, 
            @Param("zero") BigDecimal zero
    );

    @Query("SELECT e.livro.titulo, e.livro.autor, COUNT(e) FROM Emprestimo e GROUP BY e.livro.titulo, e.livro.autor ORDER BY COUNT(e) DESC")
    List<Object[]> findLivrosMaisEmprestadosRaw(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT e.livro.categoria, COUNT(e) FROM Emprestimo e GROUP BY e.livro.categoria")
    List<Object[]> findEmprestimosPorCategoriaRaw();
}
