package com.biblioteca.acervo.service;

import com.biblioteca.acervo.dto.LivroRequest;
import com.biblioteca.acervo.dto.LivroResponse;
import com.biblioteca.acervo.exception.RecursoNaoEncontradoException;
import com.biblioteca.acervo.exception.RegraNegocioException;
import com.biblioteca.acervo.model.Livro;
import com.biblioteca.acervo.model.StatusEmprestimo;
import com.biblioteca.acervo.repository.EmprestimoRepository;
import com.biblioteca.acervo.repository.LivroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class LivroService {

    private final LivroRepository livroRepository;
    private final EmprestimoRepository emprestimoRepository;

    public LivroService(LivroRepository livroRepository, EmprestimoRepository emprestimoRepository) {
        this.livroRepository = livroRepository;
        this.emprestimoRepository = emprestimoRepository;
    }

    @Transactional(readOnly = true)
    public List<LivroResponse> listar(String termo) {
        List<Livro> livros = livroRepository.pesquisarAcervo(termo);
        return livros.stream()
                .map(this::mapearParaResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LivroResponse buscarPorId(UUID id) {
        Livro livro = livroRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Livro não encontrado com o ID: " + id));
        return mapearParaResponse(livro);
    }

    @Transactional
    public LivroResponse criar(LivroRequest request) {
        if (livroRepository.existsByIsbn(request.getIsbn())) {
            throw new RegraNegocioException("Já existe um livro cadastrado com o ISBN: " + request.getIsbn());
        }

        Livro livro = Livro.builder()
                .titulo(request.getTitulo())
                .autor(request.getAutor())
                .isbn(request.getIsbn())
                .categoria(request.getCategoria())
                .quantidadeTotal(request.getQuantidadeTotal())
                .quantidadeDisponivel(request.getQuantidadeTotal()) // Inicialmente todos estão disponíveis
                .build();

        Livro livroSalvo = livroRepository.save(livro);
        return mapearParaResponse(livroSalvo);
    }

    @Transactional
    public LivroResponse atualizar(UUID id, LivroRequest request) {
        Livro livro = livroRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Livro não encontrado com o ID: " + id));

        if (livroRepository.existsByIsbnAndIdNot(request.getIsbn(), id)) {
            throw new RegraNegocioException("Já existe outro livro cadastrado com o ISBN: " + request.getIsbn());
        }

        int exemplaresEmprestados = livro.getQuantidadeTotal() - livro.getQuantidadeDisponivel();
        if (request.getQuantidadeTotal() < exemplaresEmprestados) {
            throw new RegraNegocioException("Não é possível reduzir a quantidade total para " + request.getQuantidadeTotal() +
                    " porque existem " + exemplaresEmprestados + " exemplares atualmente emprestados.");
        }

        // Calcula a nova quantidade disponível com base na diferença do novo total
        int diferencaTotal = request.getQuantidadeTotal() - livro.getQuantidadeTotal();
        int novaDisponivel = livro.getQuantidadeDisponivel() + diferencaTotal;

        livro.setTitulo(request.getTitulo());
        livro.setAutor(request.getAutor());
        livro.setIsbn(request.getIsbn());
        livro.setCategoria(request.getCategoria());
        livro.setQuantidadeTotal(request.getQuantidadeTotal());
        livro.setQuantidadeDisponivel(novaDisponivel);

        Livro livroSalvo = livroRepository.save(livro);
        return mapearParaResponse(livroSalvo);
    }

    @Transactional
    public void deletar(UUID id) {
        Livro livro = livroRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Livro não encontrado com o ID: " + id));

        // RF10 / RN07: Impede exclusão se o livro possuir empréstimos ativos ou atrasados
        boolean possuiEmprestimosAtivos = emprestimoRepository.existsByLivroIdAndStatusIn(
                id, 
                Arrays.asList(StatusEmprestimo.ATIVO, StatusEmprestimo.ATRASADO)
        );

        if (possuiEmprestimosAtivos) {
            throw new RegraNegocioException("Não é possível excluir o livro porque ele possui empréstimos ativos ou atrasados.");
        }
        
        livroRepository.delete(livro);
    }

    private LivroResponse mapearParaResponse(Livro livro) {
        return LivroResponse.builder()
                .id(livro.getId())
                .titulo(livro.getTitulo())
                .autor(livro.getAutor())
                .isbn(livro.getIsbn())
                .categoria(livro.getCategoria())
                .quantidadeTotal(livro.getQuantidadeTotal())
                .quantidadeDisponivel(livro.getQuantidadeDisponivel())
                .dataCadastro(livro.getDataCadastro())
                .build();
    }
}
