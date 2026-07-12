import React, { useState, useEffect } from 'react';
import { loanService, Emprestimo } from '../services/loanService';
import { reservationService, Reserva } from '../services/reservationService';
import SeloCarimbo from '../components/SeloCarimbo';
import { Calendar, CircleAlert, Landmark, BookCheck, ClipboardList, Bookmark, CheckSquare } from 'lucide-react';

export default function PainelLeitor() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'emprestimos' | 'reservas'>('emprestimos');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const carregarDados = async () => {
    setLoading(true);
    setErro(null);
    try {
      const [loansData, reservationsData] = await Promise.all([
        loanService.listarMeus(),
        reservationService.listarMinhas()
      ]);
      setEmprestimos(loansData);
      setReservas(reservationsData);
    } catch (err: any) {
      console.error(err);
      setErro('Falha ao sincronizar as informações da sua ficha.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleConfirmarReserva = async (id: string, tituloLivro: string) => {
    setErro(null);
    setSucesso(null);
    try {
      await reservationService.confirmar(id);
      setSucesso(`Empréstimo de "${tituloLivro}" confirmado com sucesso!`);
      carregarDados();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.mensagem || 'Falha ao confirmar empréstimo da reserva. Verifique seu limite de empréstimos.';
      setErro(msg);
    }
  };

  const formatarData = (dataStr: string) => {
    return new Date(dataStr).toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  // Resumos do painel superior
  const ativos = emprestimos.filter(e => e.status === 'ATIVO' || e.status === 'ATRASADO');
  const reservasAguardando = reservas.filter(r => r.status === 'AGUARDANDO' || r.status === 'NOTIFICADO');
  const totalMultas = emprestimos.reduce((acc, curr) => acc + (curr.status !== 'DEVOLVIDO' ? curr.valorMulta : 0), 0);

  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ClipboardList size={32} style={{ color: 'var(--color-carmesim)' }} />
          Minha Ficha de Leitor
        </h2>
        <p style={{ color: 'rgba(20, 24, 31, 0.7)', fontSize: '0.95rem' }}>
          Consulte o histórico de suas locações, acompanhe os prazos de devolução e gerencie sua fila de reservas.
        </p>
      </div>

      {/* Resumo de Metadados do Leitor */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div className="card-ficha" style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-azeitona-light)', color: 'var(--color-azeitona)' }}>
            <BookCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(20,24,31,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>Locações Ativas</div>
            <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{ativos.length} / 3</div>
          </div>
        </div>

        <div className="card-ficha" style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(201, 162, 39, 0.1)', color: 'var(--color-dourado)' }}>
            <Bookmark size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(20,24,31,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>Reservas Ativas</div>
            <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{reservasAguardando.length}</div>
          </div>
        </div>

        <div className="card-ficha" style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: totalMultas > 0 ? 'var(--color-carmesim-light)' : 'rgba(201,162,39,0.05)', color: totalMultas > 0 ? 'var(--color-carmesim)' : 'rgba(20,24,31,0.4)' }}>
            <Landmark size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(20,24,31,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>Multas Pendentes</div>
            <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: totalMultas > 0 ? 'var(--color-carmesim)' : 'inherit' }}>
              {formatarMoeda(totalMultas)}
            </div>
          </div>
        </div>
      </div>

      {erro && (
        <div style={{ 
          backgroundColor: 'var(--color-carmesim-light)', 
          borderLeft: '4px solid var(--color-carmesim)',
          color: 'var(--color-carmesim)',
          padding: '12px',
          borderRadius: '4px',
          fontSize: '0.9rem',
          marginBottom: '20px'
        }}>
          {erro}
        </div>
      )}

      {sucesso && (
        <div style={{ 
          backgroundColor: 'var(--color-azeitona-light)', 
          borderLeft: '4px solid var(--color-azeitona)',
          color: 'var(--color-azeitona)',
          padding: '12px',
          borderRadius: '4px',
          fontSize: '0.9rem',
          marginBottom: '20px'
        }}>
          {sucesso}
        </div>
      )}

      {/* Tabs Internas */}
      <div className="card-ficha" style={{ padding: 0 }}>
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid rgba(20,24,31,0.1)', 
          backgroundColor: 'rgba(20,24,31,0.01)',
          padding: '12px 24px 0 24px',
          gap: '12px'
        }}>
          <button 
            className="btn"
            style={{
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              borderBottomColor: activeSubTab === 'emprestimos' ? 'transparent' : 'rgba(20,24,31,0.1)',
              backgroundColor: activeSubTab === 'emprestimos' ? '#FCF9F5' : 'transparent',
              fontWeight: 600,
              padding: '8px 16px',
              fontSize: '0.85rem'
            }}
            onClick={() => setActiveSubTab('emprestimos')}
          >
            Locações e Histórico
          </button>
          <button 
            className="btn"
            style={{
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              borderBottomColor: activeSubTab === 'reservas' ? 'transparent' : 'rgba(20,24,31,0.1)',
              backgroundColor: activeSubTab === 'reservas' ? '#FCF9F5' : 'transparent',
              fontWeight: 600,
              padding: '8px 16px',
              fontSize: '0.85rem'
            }}
            onClick={() => setActiveSubTab('reservas')}
          >
            Fila de Reservas ({reservasAguardando.length})
          </button>
        </div>

        {/* Tab 1: Empréstimos */}
        {activeSubTab === 'emprestimos' && (
          <div>
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
              <div className="flex-center" style={{ height: '150px', color: 'rgba(20,24,31,0.4)', flexDirection: 'column', gap: '8px' }}>
                Nenhum empréstimo registrado em sua ficha de leitor.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(20,24,31,0.02)', borderBottom: '1px solid rgba(20,24,31,0.1)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Livro Emprestado</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Data de Retirada</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Devolução Prevista</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Data de Entrega</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Multa</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Status</th>
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
                          <div style={{ fontWeight: 600 }}>{emp.livro.titulo}</div>
                          <div style={{ fontSize: '0.8rem', color: 'rgba(20,24,31,0.6)' }}>por {emp.livro.autor} (ISBN: {emp.livro.isbn})</div>
                        </td>
                        <td style={{ padding: '12px 16px' }} className="mono">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} style={{ opacity: 0.5 }} />
                            {formatarData(emp.dataEmprestimo)}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }} className="mono">{formatarData(emp.dataPrevistaDevolucao)}</td>
                        <td style={{ padding: '12px 16px' }} className="mono">
                          {emp.dataDevolucaoReal ? (
                            formatarData(emp.dataDevolucaoReal)
                          ) : (
                            <span style={{ opacity: 0.5 }}>—</span>
                          )}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Reservas */}
        {activeSubTab === 'reservas' && (
          <div>
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
            ) : reservas.length === 0 ? (
              <div className="flex-center" style={{ height: '150px', color: 'rgba(20,24,31,0.4)' }}>
                Nenhuma reserva cadastrada na sua lista.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(20,24,31,0.02)', borderBottom: '1px solid rgba(20,24,31,0.1)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Livro Reservado</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Data de Reserva</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Posição na Fila</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status do Registro</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Ações de Ficha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservas.map((res) => {
                      const isNotificado = res.status === 'NOTIFICADO';
                      return (
                        <tr 
                          key={res.id} 
                          style={{ 
                            borderBottom: '1px solid rgba(20,24,31,0.08)',
                            backgroundColor: isNotificado ? 'rgba(201,162,39,0.05)' : 'transparent'
                          }}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 600 }}>{res.livro.titulo}</div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(20,24,31,0.6)' }}>por {res.livro.autor} (ISBN: {res.livro.isbn})</div>
                          </td>
                          <td style={{ padding: '12px 16px' }} className="mono">{formatarData(res.dataReserva)}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }} className="mono">
                            {res.status === 'AGUARDANDO' ? (
                              <span style={{ fontWeight: 'bold', color: 'var(--color-navy)' }}>
                                {res.posicaoFila}º lugar
                              </span>
                            ) : (
                              <span style={{ opacity: 0.5 }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <SeloCarimbo status={res.status} style={{ fontSize: '0.7rem', alignSelf: 'flex-start' }} />
                              {isNotificado && res.dataNotificacao && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-carmesim)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <CircleAlert size={12} /> Expira em: {formatarData(new Date(new Date(res.dataNotificacao).getTime() + 48*60*60*1000).toISOString())}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            {isNotificado ? (
                              <button 
                                className="btn btn-primary" 
                                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                onClick={() => handleConfirmarReserva(res.id, res.livro.titulo)}
                              >
                                <CheckSquare size={12} /> Confirmar Empréstimo
                              </button>
                            ) : res.status === 'AGUARDANDO' ? (
                              <span style={{ fontSize: '0.8rem', color: 'rgba(20,24,31,0.5)', fontStyle: 'italic' }}>
                                Aguardando exemplar retornar
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Finalizado</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
