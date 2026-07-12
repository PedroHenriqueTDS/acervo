CREATE TABLE emprestimo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    livro_id UUID NOT NULL REFERENCES livro(id) ON DELETE RESTRICT,
    data_emprestimo TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_prevista_devolucao TIMESTAMP NOT NULL,
    data_devolucao_real TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    valor_multa NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    
    -- Restrições de Integridade
    CONSTRAINT chk_valor_multa CHECK (valor_multa >= 0)
);

-- Índices para otimização de consultas e relatórios
CREATE INDEX idx_emprestimo_usuario ON emprestimo(usuario_id);
CREATE INDEX idx_emprestimo_livro ON emprestimo(livro_id);
CREATE INDEX idx_emprestimo_status ON emprestimo(status);
