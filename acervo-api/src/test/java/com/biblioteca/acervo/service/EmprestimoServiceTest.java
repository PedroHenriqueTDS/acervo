package com.biblioteca.acervo.service;

import com.biblioteca.acervo.dto.EmprestimoRequest;
import com.biblioteca.acervo.dto.EmprestimoResponse;
import com.biblioteca.acervo.exception.RegraNegocioException;
import com.biblioteca.acervo.model.*;
import com.biblioteca.acervo.repository.EmprestimoRepository;
import com.biblioteca.acervo.repository.LivroRepository;
import com.biblioteca.acervo.repository.ReservaRepository;
import com.biblioteca.acervo.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
public class EmprestimoServiceTest {

    @Mock
    private EmprestimoRepository emprestimoRepository;
    @Mock
    private LivroRepository livroRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private ReservaRepository reservaRepository;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private EmprestimoService emprestimoService;

    private Usuario usuario;
    private Livro livro;
    private EmprestimoRequest request;

    @BeforeEach
    void setUp() {
        usuario = Usuario.builder()
                .id(UUID.randomUUID())
                .nome("Leitor de Teste")
                .email("leitor@teste.com")
                .papel(Papel.USUARIO)
                .build();

        livro = Livro.builder()
                .id(UUID.randomUUID())
                .titulo("Título de Teste")
                .autor("Autor de Teste")
                .isbn("123456")
                .categoria("Literatura")
                .quantidadeTotal(5)
                .quantidadeDisponivel(5)
                .build();

        request = new EmprestimoRequest();
        request.setLivroId(livro.getId());
    }

    @Test
    void solicitarEmprestimo_ComSucesso() {
        // Arrange
        when(usuarioRepository.findByEmail(usuario.getEmail())).thenReturn(Optional.of(usuario));
        when(livroRepository.findByIdWithLock(request.getLivroId())).thenReturn(Optional.of(livro));
        when(emprestimoRepository.countByUsuarioEmailAndStatusIn(anyString(), anyList())).thenReturn(0L);
        when(emprestimoRepository.possuiMultaPendente(any(), anyList(), any())).thenReturn(false);

        when(emprestimoRepository.save(any(Emprestimo.class))).thenAnswer(invocation -> {
            Emprestimo emp = invocation.getArgument(0);
            emp.setId(UUID.randomUUID());
            emp.setDataEmprestimo(LocalDateTime.now());
            emp.setDataPrevistaDevolucao(LocalDateTime.now().plusDays(14));
            return emp;
        });

        // Act
        EmprestimoResponse response = emprestimoService.solicitarEmprestimo(usuario.getEmail(), request);

        // Assert
        assertNotNull(response);
        assertEquals(StatusEmprestimo.ATIVO, response.getStatus());
        assertEquals(4, livro.getQuantidadeDisponivel()); // Decrementou estoque
        verify(livroRepository, times(1)).save(livro);
        verify(emprestimoRepository, times(1)).save(any(Emprestimo.class));
        verify(emailService, times(1)).enviarConfirmacaoEmprestimo(any(), any(), any(), any());
    }

    @Test
    void solicitarEmprestimo_LivroSemEstoque_LancaException() {
        // Arrange
        livro.setQuantidadeDisponivel(0);
        when(usuarioRepository.findByEmail(usuario.getEmail())).thenReturn(Optional.of(usuario));
        when(livroRepository.findByIdWithLock(request.getLivroId())).thenReturn(Optional.of(livro));

        // Act & Assert
        RegraNegocioException exception = assertThrows(RegraNegocioException.class, () -> {
            emprestimoService.solicitarEmprestimo(usuario.getEmail(), request);
        });

        assertTrue(exception.getMessage().contains("Não existem exemplares disponíveis"));
        assertEquals(0, livro.getQuantidadeDisponivel()); // Estoque inalterado
        verify(emprestimoRepository, never()).save(any());
    }

    @Test
    void solicitarEmprestimo_LimiteEmprestimosAtingido_LancaException() {
        // Arrange
        when(usuarioRepository.findByEmail(usuario.getEmail())).thenReturn(Optional.of(usuario));
        when(livroRepository.findByIdWithLock(request.getLivroId())).thenReturn(Optional.of(livro));
        when(emprestimoRepository.countByUsuarioEmailAndStatusIn(anyString(), anyList())).thenReturn(3L);

        // Act & Assert
        RegraNegocioException exception = assertThrows(RegraNegocioException.class, () -> {
            emprestimoService.solicitarEmprestimo(usuario.getEmail(), request);
        });

        assertTrue(exception.getMessage().contains("limite de 3 empréstimos ativos"));
        verify(emprestimoRepository, never()).save(any());
    }

    @Test
    void solicitarEmprestimo_UsuarioComMultasPendentes_LancaException() {
        // Arrange
        when(usuarioRepository.findByEmail(usuario.getEmail())).thenReturn(Optional.of(usuario));
        when(livroRepository.findByIdWithLock(request.getLivroId())).thenReturn(Optional.of(livro));
        when(emprestimoRepository.countByUsuarioEmailAndStatusIn(anyString(), anyList())).thenReturn(1L);
        when(emprestimoRepository.possuiMultaPendente(any(), anyList(), any())).thenReturn(true);

        // Act & Assert
        RegraNegocioException exception = assertThrows(RegraNegocioException.class, () -> {
            emprestimoService.solicitarEmprestimo(usuario.getEmail(), request);
        });

        assertTrue(exception.getMessage().contains("multas pendentes por atraso"));
        verify(emprestimoRepository, never()).save(any());
    }

    @Test
    void registrarDevolucao_SemAtraso_ComSucesso() {
        // Arrange
        UUID empId = UUID.randomUUID();
        Emprestimo emprestimo = Emprestimo.builder()
                .id(empId)
                .usuario(usuario)
                .livro(livro)
                .status(StatusEmprestimo.ATIVO)
                .dataEmprestimo(LocalDateTime.now().minusDays(5))
                .dataPrevistaDevolucao(LocalDateTime.now().plusDays(9))
                .valorMulta(BigDecimal.ZERO)
                .build();
        livro.setQuantidadeDisponivel(4);

        when(emprestimoRepository.findById(empId)).thenReturn(Optional.of(emprestimo));
        when(reservaRepository.findFirstByLivroIdAndStatusOrderByPosicaoFilaAsc(any(), any())).thenReturn(Optional.empty());
        when(emprestimoRepository.save(any(Emprestimo.class))).thenReturn(emprestimo);

        // Act
        EmprestimoResponse response = emprestimoService.registrarDevolucao(empId);

        // Assert
        assertNotNull(response);
        assertEquals(StatusEmprestimo.DEVOLVIDO, response.getStatus());
        assertEquals(BigDecimal.ZERO, response.getValorMulta());
        assertEquals(5, livro.getQuantidadeDisponivel()); // Incrementou estoque
        verify(livroRepository, times(1)).save(livro);
    }

    @Test
    void registrarDevolucao_ComAtraso_CalculaMulta() {
        // Arrange
        UUID empId = UUID.randomUUID();
        Emprestimo emprestimo = Emprestimo.builder()
                .id(empId)
                .usuario(usuario)
                .livro(livro)
                .status(StatusEmprestimo.ATIVO)
                .dataEmprestimo(LocalDateTime.now().minusDays(20))
                .dataPrevistaDevolucao(LocalDateTime.now().minusDays(6)) // Atraso de 6 dias
                .valorMulta(BigDecimal.ZERO)
                .build();
        livro.setQuantidadeDisponivel(4);

        when(emprestimoRepository.findById(empId)).thenReturn(Optional.of(emprestimo));
        when(reservaRepository.findFirstByLivroIdAndStatusOrderByPosicaoFilaAsc(any(), any())).thenReturn(Optional.empty());
        when(emprestimoRepository.save(any(Emprestimo.class))).thenReturn(emprestimo);

        // Act
        EmprestimoResponse response = emprestimoService.registrarDevolucao(empId);

        // Assert
        assertNotNull(response);
        assertEquals(StatusEmprestimo.DEVOLVIDO, response.getStatus());
        assertTrue(response.getValorMulta().compareTo(BigDecimal.valueOf(6.00)) == 0); // Multa de R$ 6,00 (6 dias)
        assertEquals(5, livro.getQuantidadeDisponivel());
        verify(livroRepository, times(1)).save(livro);
    }
}
