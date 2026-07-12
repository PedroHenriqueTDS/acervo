import React, { useState, useEffect } from 'react';
import { bookService, Livro } from '../services/bookService';
import LombadaLivro from '../components/LombadaLivro';
import SeloCarimbo from '../components/SeloCarimbo';
import { Search, Book, BookmarkPlus, Plus, Library, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CatalogoProps {
  onNavigateToGerenciamento?: () => void;
  onSolicitarEmprestimo?: (livro: Livro) => void;
  onSolicitarReserva?: (livro: Livro) => void;
}

export default function Catalogo({ 
  onNavigateToGerenciamento, 
  onSolicitarEmprestimo,
  onSolicitarReserva 
}: CatalogoProps) {
  const { user } = useAuth();
  const [livros, setLivros] = useState<Livro[]>([]);
  const [termo, setTermo] = useState('');
  const [loading, setLoading] = useState(true);
  const [imagemErros, setImagemErros] = useState<Record<string, boolean>>({});
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);

  // Carrega os livros da API
  const carregarLivros = async (busca?: string) => {
    setLoading(true);
    try {
      const data = await bookService.listar(busca);
      setLivros(data);
    } catch (err) {
      console.error('Erro ao buscar livros do acervo:', err);
    } finally {
      setLoading(false);
    }
  };

  // Efeito de busca com debounce simples (300ms)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      carregarLivros(termo);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [termo]);

  const handleImageError = (isbn: string) => {
    setImagemErros(prev => ({ ...prev, [isbn]: true }));
  };

  const categoriasUnicas = Array.from(new Set(livros.map(l => l.categoria))).sort();
  const livrosFiltrados = livros.filter(l => 
    categoriaSelecionada ? l.categoria === categoriaSelecionada : true
  );

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Cabeçalho da Seção */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Library size={32} style={{ color: 'var(--color-carmesim)' }} />
            Acervo da Biblioteca
          </h2>
          <p style={{ color: 'rgba(20, 24, 31, 0.7)', fontSize: '0.95rem' }}>
            Consulte os livros catalogados e verifique a disponibilidade em tempo real.
          </p>
        </div>

        {user?.papel === 'BIBLIOTECARIO' && onNavigateToGerenciamento && (
          <button 
            className="btn btn-primary" 
            onClick={onNavigateToGerenciamento}
            style={{ padding: '10px 18px' }}
          >
            <Plus size={16} /> Gerenciar Acervo
          </button>
        )}
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="card-ficha" style={{ padding: '16px', marginBottom: '32px' }}>
        <div style={{ position: 'relative', marginBottom: categoriasUnicas.length > 0 ? '16px' : '0' }}>
          <Search 
            size={20} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'rgba(20, 24, 31, 0.4)' 
            }} 
          />
          <input
            type="text"
            className="input-field"
            placeholder="Pesquisar por título, autor, categoria ou ISBN..."
            style={{ paddingLeft: '44px' }}
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
          />
        </div>

        {categoriasUnicas.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className={`btn ${categoriaSelecionada === null ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '20px', border: categoriaSelecionada === null ? 'none' : '1px solid rgba(20,24,31,0.1)' }}
              onClick={() => setCategoriaSelecionada(null)}
            >
              Todas
            </button>
            {categoriasUnicas.map(cat => (
              <button
                key={cat}
                className={`btn ${categoriaSelecionada === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '20px', border: categoriaSelecionada === cat ? 'none' : '1px solid rgba(20,24,31,0.1)' }}
                onClick={() => setCategoriaSelecionada(cat === categoriaSelecionada ? null : cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid de Livros */}
      {loading ? (
        <div className="flex-center" style={{ height: '200px', flexDirection: 'column', gap: '12px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: '3px solid rgba(20, 24, 31, 0.1)',
            borderTopColor: 'var(--color-navy)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span className="mono" style={{ fontSize: '0.8rem' }}>Consultando fichas...</span>
        </div>
      ) : livrosFiltrados.length === 0 ? (
        <div className="card-ficha flex-center" style={{ height: '200px', flexDirection: 'column', gap: '12px' }}>
          <Book size={40} style={{ opacity: 0.3 }} />
          <p style={{ fontWeight: 600, color: 'rgba(20, 24, 31, 0.5)' }}>Nenhum livro encontrado para sua pesquisa.</p>
        </div>
      ) : (
        <div className="grid-acervo">
          {livrosFiltrados.map((livro) => {
            const hasCoverError = imagemErros[livro.isbn];
            const coverUrl = `https://covers.openlibrary.org/b/isbn/${livro.isbn}-M.jpg?default=false`;

            return (
              <div key={livro.id} className="card-ficha" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Visual da Capa */}
                <div className="flex-center" style={{ 
                  backgroundColor: 'rgba(20, 24, 31, 0.03)', 
                  height: '260px', 
                  borderRadius: 'var(--border-radius)',
                  marginBottom: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid rgba(20,24,31,0.06)'
                }}>
                  {!hasCoverError ? (
                    <img 
                      src={coverUrl} 
                      alt={`Capa do livro ${livro.titulo}`}
                      style={{ height: '240px', objectFit: 'contain', boxShadow: 'var(--shadow-md)' }}
                      onError={() => handleImageError(livro.isbn)}
                    />
                  ) : (
                    <LombadaLivro 
                      titulo={livro.titulo} 
                      autor={livro.autor} 
                      isbn={livro.isbn} 
                      categoria={livro.categoria} 
                    />
                  )}
                </div>

                {/* Detalhes do Livro */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span className="mono" style={{ fontSize: '0.75rem', color: 'rgba(20,24,31,0.5)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                    {livro.categoria}
                  </span>
                  <h3 
                    style={{ fontSize: '1.2rem', lineHeight: 1.3, marginBottom: '6px', cursor: 'pointer' }}
                    title={livro.titulo}
                  >
                    {livro.titulo}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(20,24,31,0.7)', marginBottom: '12px' }}>
                    por <span style={{ fontWeight: 500 }}>{livro.autor}</span>
                  </p>

                  <div className="mono" style={{ fontSize: '0.75rem', color: 'rgba(20,24,31,0.6)', marginTop: 'auto', marginBottom: '16px' }}>
                    <div>ISBN: {livro.isbn}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span>Estoque Total: {livro.quantidadeTotal}</span>
                      <span style={{ fontWeight: 600, color: livro.quantidadeDisponivel > 0 ? 'var(--color-azeitona)' : 'var(--color-carmesim)' }}>
                        Disponível: {livro.quantidadeDisponivel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Carimbos e Ações */}
                <div style={{ 
                  borderTop: '1px dashed rgba(20,24,31,0.12)', 
                  paddingTop: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  {livro.quantidadeDisponivel > 0 ? (
                    <SeloCarimbo status="DISPONIVEL" style={{ fontSize: '0.75rem' }} />
                  ) : (
                    <SeloCarimbo status="ESGOTADO" style={{ fontSize: '0.75rem' }} />
                  )}

                  {user?.papel === 'USUARIO' && (
                    <>
                      {livro.quantidadeDisponivel > 0 ? (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => onSolicitarEmprestimo?.(livro)}
                        >
                          <BookOpen size={14} /> Emprestar
                        </button>
                      ) : (
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => onSolicitarReserva?.(livro)}
                        >
                          <BookmarkPlus size={14} /> Reservar
                        </button>
                      )}
                    </>
                  )}

                  {user?.papel === 'BIBLIOTECARIO' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', opacity: 0.6 }} className="mono">Admin Mode</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
