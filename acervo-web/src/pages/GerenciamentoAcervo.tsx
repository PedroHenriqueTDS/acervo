import React, { useState, useEffect } from 'react';
import { bookService, Livro, LivroRequest } from '../services/bookService';
import { ArrowLeft, Edit, Trash2, Save, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

interface GerenciamentoAcervoProps {
  onVoltar: () => void;
}

export default function GerenciamentoAcervo({ onVoltar }: GerenciamentoAcervoProps) {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do formulário
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [categoria, setCategoria] = useState('');
  const [quantidadeTotal, setQuantidadeTotal] = useState<number | ''>('');
  
  // Feedback
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [buscandoIsbn, setBuscandoIsbn] = useState(false);
  const [semeando, setSemeando] = useState(false);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const data = await bookService.listar();
      setLivros(data);
    } catch (err) {
      console.error(err);
      setMensagemErro('Não foi possível carregar a lista de livros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const buscarIsbnExterno = async () => {
    const cleanIsbn = isbn.trim();
    if (!cleanIsbn) return;

    setBuscandoIsbn(true);
    setMensagemErro(null);
    setMensagemSucesso(null);

    try {
      // 1. Tentar Google Books API
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`);
      if (!response.ok) throw new Error('API do Google respondeu com erro');
      const data = await response.json();

      if (data.totalItems > 0 && data.items?.[0]?.volumeInfo) {
        const info = data.items[0].volumeInfo;
        setTitulo(info.title || '');
        setAutor(info.authors ? info.authors.join(', ') : '');
        setCategoria(info.categories ? info.categories[0] : 'Literatura');
        setMensagemSucesso('Metadados preenchidos via Google Books API!');
        return;
      }

      // 2. Fallback para Open Library API
      const olResponse = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&jscmd=data&format=json`);
      if (!olResponse.ok) throw new Error('API da Open Library respondeu com erro');
      const olData = await olResponse.json();
      const bookKey = `ISBN:${cleanIsbn}`;

      if (olData[bookKey]) {
        const olInfo = olData[bookKey];
        setTitulo(olInfo.title || '');
        setAutor(olInfo.authors ? olInfo.authors.map((a: any) => a.name).join(', ') : '');
        setCategoria(olInfo.subjects ? olInfo.subjects[0]?.name : 'Literatura');
        setMensagemSucesso('Metadados preenchidos via Open Library API!');
        return;
      }

      setMensagemErro('Livro não encontrado nas APIs públicas. Digite os dados manualmente.');
    } catch (err) {
      console.error(err);
      setMensagemErro('Erro ao consultar APIs de livros externos.');
    } finally {
      setBuscandoIsbn(false);
    }
  };

  const semearDadosDemo = async () => {
    setSemeando(true);
    setMensagemErro(null);
    setMensagemSucesso(null);

    const livrosDemo = [
      { titulo: 'Dom Casmurro', autor: 'Machado de Assis', isbn: '9788508129263', categoria: 'Romance', quantidadeTotal: 3 },
      { titulo: '1984', autor: 'George Orwell', isbn: '9788535914849', categoria: 'Distopia', quantidadeTotal: 4 },
      { titulo: 'O Cortiço', autor: 'Aluísio Azevedo', isbn: '9788508119899', categoria: 'Romance', quantidadeTotal: 2 },
      { titulo: 'O Pequeno Príncipe', autor: 'Antoine de Saint-Exupéry', isbn: '9788522031399', categoria: 'Infanto-Juvenil', quantidadeTotal: 5 },
      { titulo: 'A Hora da Estrela', autor: 'Clarice Lispector', isbn: '9788532512680', categoria: 'Romance', quantidadeTotal: 3 }
    ];

    try {
      for (const livro of livrosDemo) {
        await bookService.criar(livro);
      }
      setMensagemSucesso('Acervo semeado com sucesso com 5 livros clássicos!');
      carregarDados();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.mensagem || 'Falha ao semear acervo demo.';
      setMensagemErro(msg);
    } finally {
      setSemeando(false);
    }
  };

  const limparFormulario = () => {
    setEditandoId(null);
    setTitulo('');
    setAutor('');
    setIsbn('');
    setCategoria('');
    setQuantidadeTotal('');
    setMensagemErro(null);
  };

  const handleEditClick = (livro: Livro) => {
    setEditandoId(livro.id);
    setTitulo(livro.titulo);
    setAutor(livro.autor);
    setIsbn(livro.isbn);
    setCategoria(livro.categoria);
    setQuantidadeTotal(livro.quantidadeTotal);
    setMensagemErro(null);
    setMensagemSucesso(null);
  };

  const handleExcluir = async (id: string, tituloLivro: string) => {
    if (!window.confirm(`Tem certeza que deseja remover "${tituloLivro}" do acervo?`)) {
      return;
    }

    setMensagemErro(null);
    setMensagemSucesso(null);

    try {
      await bookService.deletar(id);
      setMensagemSucesso(`Livro "${tituloLivro}" excluído com sucesso.`);
      carregarDados();
      if (editandoId === id) {
        limparFormulario();
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.mensagem || 'Falha ao excluir o livro. Verifique se existem empréstimos ativos.';
      setMensagemErro(msg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemErro(null);
    setMensagemSucesso(null);

    if (!titulo || !autor || !isbn || !categoria || quantidadeTotal === '') {
      setMensagemErro('Preencha todos os campos obrigatórios.');
      return;
    }

    const payload: LivroRequest = {
      titulo,
      autor,
      isbn,
      categoria,
      quantidadeTotal: Number(quantidadeTotal)
    };

    try {
      if (editandoId) {
        await bookService.atualizar(editandoId, payload);
        setMensagemSucesso(`Livro "${titulo}" atualizado com sucesso!`);
      } else {
        await bookService.criar(payload);
        setMensagemSucesso(`Livro "${titulo}" cadastrado com sucesso!`);
      }
      limparFormulario();
      carregarDados();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.mensagem || 'Falha ao salvar dados do livro.';
      setMensagemErro(msg);
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Top Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <button className="btn btn-secondary" onClick={onVoltar} style={{ padding: '8px 12px' }}>
          <ArrowLeft size={16} /> Voltar ao Catálogo
        </button>
        <h2 style={{ fontSize: '2.2rem', margin: 0 }}>Gerenciamento de Acervo</h2>
      </div>

      {/* Alertas */}
      {mensagemSucesso && (
        <div style={{ 
          backgroundColor: 'var(--color-azeitona-light)', 
          borderLeft: '4px solid var(--color-azeitona)',
          color: 'var(--color-azeitona)',
          padding: '12px',
          borderRadius: '4px',
          fontSize: '0.9rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={18} /> {mensagemSucesso}
        </div>
      )}

      {mensagemErro && (
        <div style={{ 
          backgroundColor: 'var(--color-carmesim-light)', 
          borderLeft: '4px solid var(--color-carmesim)',
          color: 'var(--color-carmesim)',
          padding: '12px',
          borderRadius: '4px',
          fontSize: '0.9rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={18} /> {mensagemErro}
        </div>
      )}

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Lado Esquerdo: Lista de Livros */}
        <div style={{ flex: '2 1 600px', minWidth: '350px' }}>
          <div className="card-ficha" style={{ padding: '0' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(20,24,31,0.1)' }}>
              <h3 style={{ fontSize: '1.4rem' }}>Fichas Catalogadas</h3>
              <p style={{ color: 'rgba(20,24,31,0.6)', fontSize: '0.85rem' }}>Lista de todos os títulos em estoque.</p>
            </div>

            {loading ? (
              <div className="flex-center" style={{ height: '200px' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  border: '3px solid rgba(20, 24, 31, 0.1)',
                  borderTopColor: 'var(--color-navy)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
            ) : livros.length === 0 ? (
              <div className="flex-center" style={{ height: '220px', flexDirection: 'column', gap: '16px', padding: '24px', textAlign: 'center' }}>
                <div style={{ color: 'rgba(20,24,31,0.5)', fontWeight: 600 }}>Nenhum livro catalogado no momento.</div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={semearDadosDemo}
                  disabled={semeando}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
                >
                  {semeando ? 'Semeando...' : 'Semear 5 Livros Clássicos (Demo)'}
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(20,24,31,0.02)', borderBottom: '1px solid rgba(20,24,31,0.1)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Título / Autor</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }} className="mono">ISBN</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Categoria</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Qtd. Disp/Total</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {livros.map((livro) => (
                      <tr 
                        key={livro.id} 
                        style={{ 
                          borderBottom: '1px solid rgba(20,24,31,0.08)',
                          backgroundColor: editandoId === livro.id ? 'rgba(201, 162, 39, 0.08)' : 'transparent'
                        }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{livro.titulo}</div>
                          <div style={{ fontSize: '0.8rem', color: 'rgba(20,24,31,0.6)' }}>{livro.autor}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }} className="mono">{livro.isbn}</td>
                        <td style={{ padding: '12px 16px' }}>{livro.categoria}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }} className="mono">
                          <span style={{ fontWeight: 'bold', color: livro.quantidadeDisponivel > 0 ? 'var(--color-azeitona)' : 'var(--color-carmesim)' }}>
                            {livro.quantidadeDisponivel}
                          </span>
                          /{livro.quantidadeTotal}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button 
                              className="btn" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                              onClick={() => handleEditClick(livro)}
                              title="Editar Ficha"
                            >
                              <Edit size={12} />
                            </button>
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => handleExcluir(livro.id, livro.titulo)}
                              title="Excluir do Acervo"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: Formulário */}
        <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
          <div className="card-ficha">
            <h3 style={{ fontSize: '1.4rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} style={{ color: 'var(--color-dourado)' }} />
              {editandoId ? 'Editar Ficha' : 'Nova Ficha'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="titulo">Título do Livro</label>
                <input
                  id="titulo"
                  type="text"
                  className="input-field"
                  placeholder="Ex: O Cortiço"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="autor">Autor</label>
                <input
                  id="autor"
                  type="text"
                  className="input-field"
                  placeholder="Ex: Aluísio Azevedo"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="isbn">Código ISBN (Único)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="isbn"
                    type="text"
                    className="input-field mono"
                    placeholder="Ex: 9788508119899"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={buscarIsbnExterno}
                    disabled={!isbn || buscandoIsbn}
                    style={{ whiteSpace: 'nowrap', padding: '0 16px', fontSize: '0.85rem' }}
                  >
                    {buscandoIsbn ? 'Buscando...' : 'Preencher via API'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="categoria">Categoria / Gênero</label>
                <input
                  id="categoria"
                  type="text"
                  className="input-field"
                  placeholder="Ex: Clássico Brasileiro"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label htmlFor="quantidadeTotal">Quantidade total em Estoque</label>
                <input
                  id="quantidadeTotal"
                  type="number"
                  min="0"
                  className="input-field mono"
                  placeholder="Ex: 5"
                  value={quantidadeTotal}
                  onChange={(e) => setQuantidadeTotal(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <Save size={14} /> Salvar Ficha
                </button>
                {editandoId && (
                  <button type="button" className="btn btn-secondary" onClick={limparFormulario}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
