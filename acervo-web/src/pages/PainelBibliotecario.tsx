import React, { useState, useEffect } from 'react';
import { loanService, Emprestimo } from '../services/loanService';
import SeloCarimbo from '../components/SeloCarimbo';
import { BookCheck, ClipboardList, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function PainelBibliotecario() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'ativos' | 'atrasados'>('ativos');
  const [loading, setLoading] = useState(true);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const carregarEmprestimos = async () => {
    setLoading(true);
    setMensagemErro(null);
    try {
      let data: Emprestimo[] = [];
      if (filtro === 'todos') {
        data = await loanService.listarTodos();
      } else if (filtro === 'ativos') {
        const todos = await loanService.listarTodos();
        data = todos.filter(e => e.status === 'ATIVO' || e.status === 'ATRASADO');
      } else if (filtro === 'atrasados') {
        data = await loanService.listarAtrasados();
      }
      setEmprestimos(data);
    } catch (err: any) {
      console.error(err);
      setMensagemErro('Falha ao carregar a lista de empréstimos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEmprestimos();
  }, [filtro]);

  const handleCronTrigger = async () => {
    setMensagemSucesso(null);
    setMensagemErro(null);
    try {
      const response = await api.post<string>('/admin/cron-trigger');
      setMensagemSucesso(response.data);
      carregarEmprestimos();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.mensagem || 'Falha ao forçar a rotina diária de multas.';
      setMensagemErro(msg);
    }
  };

  const handleDevolucao = async (id: string, tituloLivro: string, nomeUsuario: string) => {
    if (!window.confirm(`Confirmar devolução do livro "${tituloLivro}" retirado por ${nomeUsuario}?`)) {
      return;
    }

    setMensagemSucesso(null);
    setMensagemErro(null);

    try {
      const response = await loanService.devolver(id);
      let msg = `Livro "${tituloLivro}" devolvido por ${nomeUsuario}.`;
      if (response.valorMulta > 0) {
        msg += ` Multa calculada por atraso: R$ ${response.valorMulta.toFixed(2)}`;
      }
      setMensagemSucesso(msg);
      carregarEmprestimos();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.mensagem || 'Falha ao processar devolução.';
      setMensagemErro(msg);
    }
  };

  const formatarData = (dataStr: string) => {
    return new Date(dataStr).toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ClipboardList size={32} style={{ color: 'var(--color-carmesim)' }} />
          Painel de Empréstimos
        </h2>
        <p style={{ color: 'rgba(20, 24, 31, 0.7)', fontSize: '0.95rem' }}>
          Acompanhe todos os empréstimos ativos da biblioteca, verifique os atrasos e confirme o recebimento das devoluções.
        </p>
      </div>

      {/* Alertas de Ação */}
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

      {/* Filtros */}
      <div className="card-ficha" style={{ padding: '16px', marginBottom: '28px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Filtro de Visualização:</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn" 
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.8rem',
                backgroundColor: filtro === 'ativos' ? 'var(--color-navy)' : 'transparent',
                color: filtro === 'ativos' ? 'var(--color-marfim)' : 'var(--color-navy)'
              }}
              onClick={() => setFiltro('ativos')}
            >
              Ativos / Atrasados
            </button>
            <button 
              className="btn" 
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.8rem',
                backgroundColor: filtro === 'atrasados' ? 'var(--color-carmesim)' : 'transparent',
                color: filtro === 'atrasados' ? 'var(--color-marfim)' : 'var(--color-carmesim)',
                borderColor: filtro === 'atrasados' ? 'var(--color-carmesim)' : 'currentColor'
              }}
              onClick={() => setFiltro('atrasados')}
            >
              Apenas Atrasados
            </button>
            <button 
              className="btn" 
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.8rem',
                backgroundColor: filtro === 'todos' ? 'var(--color-navy)' : 'transparent',
                color: filtro === 'todos' ? 'var(--color-marfim)' : 'var(--color-navy)'
              }}
              onClick={() => setFiltro('todos')}
            >
              Todos Históricos
            </button>
          </div>
        </div>

        <button 
          className="btn btn-secondary" 
          style={{ 
            borderColor: 'var(--color-carmesim)', 
            color: 'var(--color-carmesim)',
            backgroundColor: 'transparent',
            padding: '6px 12px',
            fontSize: '0.8rem'
          }}
          onClick={handleCronTrigger}
        >
          <ShieldCheck size={14} /> Simular Job Diário (Multas)
        </button>
      </div>

      {/* Grid/Lista */}
      <div className="card-ficha" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(20,24,31,0.1)' }}>
          <h3 style={{ fontSize: '1.4rem' }}>Fichas de Registro de Empréstimos</h3>
          <p style={{ color: 'rgba(20,24,31,0.6)', fontSize: '0.85rem' }}>Visualização centralizada de transações de locação.</p>
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
        ) : emprestimos.length === 0 ? (
          <div className="flex-center" style={{ height: '150px', color: 'rgba(20,24,31,0.4)' }}>
            Nenhum empréstimo encontrado para o filtro selecionado.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(20,24,31,0.02)', borderBottom: '1px solid rgba(20,24,31,0.1)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Leitor / E-mail</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Livro / ISBN</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Datas (Retirada / Prevista)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Multa</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {emprestimos.map((emp) => (
                  <tr 
                    key={emp.id} 
                    style={{ 
                      borderBottom: '1px solid rgba(20,24,31,0.08)',
                      backgroundColor: emp.status === 'ATRASADO' ? 'rgba(139,38,53,0.03)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{emp.usuario.nome}</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(20,24,31,0.6)' }} className="mono">{emp.usuario.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{emp.livro.titulo}</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(20,24,31,0.6)' }} className="mono">ISBN: {emp.livro.isbn}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="mono" style={{ fontSize: '0.8rem' }}>R: {formatarData(emp.dataEmprestimo)}</span>
                        <span className="mono" style={{ fontSize: '0.8rem', fontWeight: 600, color: emp.status === 'ATRASADO' ? 'var(--color-carmesim)' : 'inherit' }}>
                          V: {formatarData(emp.dataPrevistaDevolucao)}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }} className="mono">
                      {emp.valorMulta > 0 ? (
                        <span style={{ color: 'var(--color-carmesim)', fontWeight: 600 }}>
                          {formatarMoeda(emp.valorMulta)}
                        </span>
                      ) : (
                        <span style={{ opacity: 0.5 }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <SeloCarimbo status={emp.status} style={{ fontSize: '0.7rem' }} />
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {(emp.status === 'ATIVO' || emp.status === 'ATRASADO') ? (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => handleDevolucao(emp.id, emp.livro.titulo, emp.usuario.nome)}
                        >
                          <BookCheck size={12} /> Devolver
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'rgba(20,24,31,0.4)' }} className="mono">
                          Entregue em {emp.dataDevolucaoReal ? formatarData(emp.dataDevolucaoReal) : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
