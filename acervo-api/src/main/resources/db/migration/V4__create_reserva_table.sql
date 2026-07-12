CREATE TABLE reserva (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    livro_id UUID NOT NULL REFERENCES livro(id) ON DELETE RESTRICT,
    data_reserva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    posicao_fila INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    data_notificacao TIMESTAMP,
    
    -- Restrições de Integridade
    CONSTRAINT chk_posicao_fila CHECK (posicao_fila >= 1)
);

-- Índices para controle de fila
CREATE INDEX idx_reserva_usuario ON reserva(usuario_id);
CREATE INDEX idx_reserva_livro ON reserva(livro_id);
CREATE INDEX idx_reserva_status ON reserva(status);
