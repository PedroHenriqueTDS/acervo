import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Book, Bookmark, ClipboardList, AlertTriangle, TrendingUp, Tag, RefreshCw } from 'lucide-react';

interface LivroDestaque {
  titulo: string;
  autor: string;
  quantidadeEmprestimos: number;
}

interface StatsResponse {
  totalLivrosAcervo: number;
  totalEmprestimosAtivos: number;
  totalEmprestimosAtrasados: number;
  totalReservasAtivas: number;
  livrosMaisEmprestados: LivroDestaque[];
  emprestimosPorCategoria: Record<string, number>;
}

export default function DashboardAdmin() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarStats = async () => {
    setLoading(true);
    setErro(null);
    try {
      const response = await api.get<StatsResponse>('/admin/dashboard');
      setStats(response.data);
    } catch (err: any) {
      console.error(err);
      setErro('Não foi possível carregar as estatísticas do painel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '300px', flexDirection: 'column', gap: '12px' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          border: '3px solid rgba(20, 24, 31, 0.1)',
          borderTopColor: 'var(--color-navy)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span className="mono" style={{ fontSize: '0.8rem' }}>Compilando relatórios...</span>
      </div>
    );
  }

  if (erro || !stats) {
    return (
      <div className="card-ficha flex-center" style={{ height: '200px', color: 'var(--color-carmesim)' }}>
        <AlertTriangle size={24} style={{ marginRight: '8px' }} />
        <span>{erro || 'Erro ao carregar dados.'}</span>
        <button className="btn btn-secondary" style={{ marginLeft: '16px' }} onClick={carregarStats}>Tentar Novamente</button>
      </div>
    );
  }

  // Encontra a categoria com mais empréstimos para destaque
  const categorias = Object.entries(stats.emprestimosPorCategoria);
  const categoriaFavorita = categorias.length > 0
    ? categorias.reduce((max, curr) => curr[1] > max[1] ? curr : max, ['', 0])[0]
    : 'Nenhuma';

  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TrendingUp size={32} style={{ color: 'var(--color-carmesim)' }} />
            Painel de Estatísticas
          </h2>
          <p style={{ color: 'rgba(20, 24, 31, 0.7)', fontSize: '0.95rem' }}>
            Indicadores de estoque, performance de devoluções e categorias mais lidas do mês.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={carregarStats} style={{ padding: '8px 12px' }}>
          <RefreshCw size={14} /> Atualizar Relatório
        </button>
      </div>

      {/* Cards de Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div className="card-ficha" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(20,24,31,0.05)', color: 'var(--color-navy)' }}>
            <Book size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(20,24,31,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>Total de Livros</div>
            <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.totalLivrosAcervo}</div>
          </div>
        </div>

        <div className="card-ficha" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-azeitona-light)', color: 'var(--color-azeitona)' }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(20,24,31,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>Locações Ativas</div>
            <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.totalEmprestimosAtivos}</div>
          </div>
        </div>

        <div className="card-ficha" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(201, 162, 39, 0.1)', color: 'var(--color-dourado)' }}>
            <Bookmark size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(20,24,31,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>Reservas em Fila</div>
            <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.totalReservasAtivas}</div>
          </div>
        </div>

        <div className="card-ficha" style={{ 
          padding: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          borderColor: stats.totalEmprestimosAtrasados > 0 ? 'var(--color-carmesim)' : 'rgba(20,24,31,0.15)'
        }}>
          <div className="flex-center" style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            backgroundColor: stats.totalEmprestimosAtrasados > 0 ? 'var(--color-carmesim-light)' : 'rgba(20,24,31,0.05)', 
            color: stats.totalEmprestimosAtrasados > 0 ? 'var(--color-carmesim)' : 'rgba(20,24,31,0.4)' 
          }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(20,24,31,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>Em Atraso</div>
            <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: stats.totalEmprestimosAtrasados > 0 ? 'var(--color-carmesim)' : 'inherit' }}>
              {stats.totalEmprestimosAtrasados}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Bloco 1: Livros mais lidos (Top 5) */}
        <div style={{ flex: '1 1 450px' }}>
          <div className="card-ficha" style={{ height: '100%' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} style={{ color: 'var(--color-dourado)' }} />
              Livros mais Emprestados
            </h3>
            
            {stats.livrosMaisEmprestados.length === 0 ? (
              <p style={{ opacity: 0.5, fontStyle: 'italic', padding: '20px 0' }}>Ainda não há registros de empréstimos.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {stats.livrosMaisEmprestados.map((livro, idx) => {
                  const maxVal = stats.livrosMaisEmprestados[0].quantidadeEmprestimos;
                  const pct = maxVal > 0 ? (livro.quantidadeEmprestimos / maxVal) * 100 : 0;
                  return (
                    <div key={idx} style={{ borderBottom: '1px dashed rgba(20,24,31,0.08)', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <span style={{ fontWeight: 'bold', marginRight: '8px', opacity: 0.5 }}>#{idx+1}</span>
                          <span style={{ fontWeight: 600 }}>{livro.titulo}</span>
                          <span style={{ fontSize: '0.8rem', color: 'rgba(20,24,31,0.6)', display: 'block', paddingLeft: '24px' }}>
                            de {livro.autor}
                          </span>
                        </div>
                        <span className="mono" style={{ fontWeight: 'bold', fontSize: '0.9rem', backgroundColor: 'var(--color-marfim-escuro)', padding: '2px 8px', borderRadius: '2px' }}>
                          {livro.quantidadeEmprestimos}x
                        </span>
                      </div>
                      
                      {/* Barra de Progresso visual vintage */}
                      <div style={{ height: '4px', backgroundColor: 'rgba(20,24,31,0.05)', borderRadius: '2px', overflow: 'hidden', marginLeft: '24px', width: 'calc(100% - 24px)' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--color-azeitona)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bloco 2: Distribuição por Categorias */}
        <div style={{ flex: '1 1 350px' }}>
          <div className="card-ficha" style={{ height: '100%' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={20} style={{ color: 'var(--color-dourado)' }} />
              Categorias Populares
            </h3>

            {categorias.length === 0 ? (
              <p style={{ opacity: 0.5, fontStyle: 'italic', padding: '20px 0' }}>Sem dados categoria catalogados.</p>
            ) : (
              <div>
                <div style={{ 
                  backgroundColor: 'rgba(201, 162, 39, 0.08)',
                  border: '1px solid rgba(201, 162, 39, 0.2)',
                  borderRadius: 'var(--border-radius)',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, opacity: 0.7 }}>Gênero em Destaque</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', fontFamily: 'var(--font-serif)', color: 'var(--color-carmesim)' }}>
                    {categoriaFavorita}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {categorias.map(([cat, total], idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                      <span style={{ fontWeight: 500 }}>{cat}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="mono" style={{ fontWeight: 600 }}>{total} locações</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
