CREATE TABLE livro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    isbn VARCHAR(50) NOT NULL UNIQUE,
    categoria VARCHAR(100) NOT NULL,
    quantidade_total INTEGER NOT NULL,
    quantidade_disponivel INTEGER NOT NULL,
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Restrições de Integridade
    CONSTRAINT chk_quantidade_total CHECK (quantidade_total >= 0),
    CONSTRAINT chk_quantidade_disponivel CHECK (quantidade_disponivel >= 0 AND quantidade_disponivel <= quantidade_total)
);

-- Índices para otimização de buscas rápidas por título e categoria
CREATE INDEX idx_livro_titulo ON livro(titulo);
CREATE INDEX idx_livro_isbn ON livro(isbn);
CREATE INDEX idx_livro_categoria ON livro(categoria);
