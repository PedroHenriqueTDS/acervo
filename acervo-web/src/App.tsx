import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalogo from './pages/Catalogo';
import GerenciamentoAcervo from './pages/GerenciamentoAcervo';
import PainelLeitor from './pages/PainelLeitor';
import PainelBibliotecario from './pages/PainelBibliotecario';
import DashboardAdmin from './pages/DashboardAdmin';
import { loanService } from './services/loanService';
import { reservationService } from './services/reservationService';
import { Livro } from './services/bookService';
import { LogOut, BookOpen, Library, FileText, User, ClipboardList, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();
  const [pagina, setPagina] = useState<'catalogo' | 'gerenciamento' | 'emprestimos_admin' | 'dashboard_admin' | 'meus_emprestimos'>('catalogo');
  const [notification, setNotification] = useState<{ tipo: 'sucesso' | 'erro'; msg: string } | null>(null);

  const showNotification = (tipo: 'sucesso' | 'erro', msg: string) => {
    setNotification({ tipo, msg });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSolicitarEmprestimo = async (livro: Livro) => {
    try {
      await loanService.solicitar(livro.id);
      showNotification('sucesso', `Empréstimo do livro "${livro.titulo}" solicitado e registrado com sucesso!`);
      // Força a recarga do acervo mudando de aba temporariamente ou apenas re-renderizando.
      // O Catalogo possui um useEffect observando o termo de busca, então mudando para catalogo
      // ou atualizando seu estado resolverá. Aqui, apenas redefinimos para garantir atualização.
      setPagina('meus_emprestimos');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.mensagem || 'Falha ao solicitar empréstimo. Verifique se o livro está disponível.';
      showNotification('erro', msg);
    }
  };

  const handleSolicitarReserva = async (livro: Livro) => {
    try {
      await reservationService.solicitar(livro.id);
      showNotification('sucesso', `Você entrou na fila de reservas para o livro "${livro.titulo}" com sucesso!`);
      setPagina('meus_emprestimos');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.mensagem || 'Falha ao solicitar reserva.';
      showNotification('erro', msg);
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header style={{ 
        backgroundColor: 'var(--color-navy)', 
        color: 'var(--color-marfim)', 
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '4px solid var(--color-dourado)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} style={{ color: 'var(--color-dourado)' }} />
            <h1 style={{ color: 'var(--color-marfim)', fontSize: '1.4rem', fontFamily: 'var(--font-serif)' }}>Acervo</h1>
          </div>
          
          {/* Navegação entre abas */}
          <nav style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setPagina('catalogo')}
              className="btn"
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.8rem',
                backgroundColor: pagina === 'catalogo' ? 'var(--color-dourado)' : 'transparent',
                color: pagina === 'catalogo' ? 'var(--color-navy)' : 'var(--color-marfim)',
                borderColor: pagina === 'catalogo' ? 'var(--color-dourado)' : 'rgba(255,255,255,0.2)'
              }}
            >
              <Library size={14} /> Catálogo
            </button>

            {user?.papel === 'BIBLIOTECARIO' && (
              <>
                <button 
                  onClick={() => setPagina('gerenciamento')}
                  className="btn"
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '0.8rem',
                    backgroundColor: pagina === 'gerenciamento' ? 'var(--color-dourado)' : 'transparent',
                    color: pagina === 'gerenciamento' ? 'var(--color-navy)' : 'var(--color-marfim)',
                    borderColor: pagina === 'gerenciamento' ? 'var(--color-dourado)' : 'rgba(255,255,255,0.2)'
                  }}
                >
                  <FileText size={14} /> Estoque Livros
                </button>
                <button 
                  onClick={() => setPagina('emprestimos_admin')}
                  className="btn"
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '0.8rem',
                    backgroundColor: pagina === 'emprestimos_admin' ? 'var(--color-dourado)' : 'transparent',
                    color: pagina === 'emprestimos_admin' ? 'var(--color-navy)' : 'var(--color-marfim)',
                    borderColor: pagina === 'emprestimos_admin' ? 'var(--color-dourado)' : 'rgba(255,255,255,0.2)'
                  }}
                >
                  <ClipboardList size={14} /> Empréstimos
                </button>
                <button 
                  onClick={() => setPagina('dashboard_admin')}
                  className="btn"
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '0.8rem',
                    backgroundColor: pagina === 'dashboard_admin' ? 'var(--color-dourado)' : 'transparent',
                    color: pagina === 'dashboard_admin' ? 'var(--color-navy)' : 'var(--color-marfim)',
                    borderColor: pagina === 'dashboard_admin' ? 'var(--color-dourado)' : 'rgba(255,255,255,0.2)'
                  }}
                >
                  <TrendingUp size={14} /> Estatísticas
                </button>
              </>
            )}

            {user?.papel === 'USUARIO' && (
              <button 
                onClick={() => setPagina('meus_emprestimos')}
                className="btn"
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '0.8rem',
                  backgroundColor: pagina === 'meus_emprestimos' ? 'var(--color-dourado)' : 'transparent',
                  color: pagina === 'meus_emprestimos' ? 'var(--color-navy)' : 'var(--color-marfim)',
                  borderColor: pagina === 'meus_emprestimos' ? 'var(--color-dourado)' : 'rgba(255,255,255,0.2)'
                }}
              >
                <User size={14} /> Meus Empréstimos
              </button>
            )}
          </nav>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--color-dourado)' }}>
              {user?.nome} ({user?.papel === 'BIBLIOTECARIO' ? 'Admin' : 'Leitor'})
            </span>
          </div>
          
          <button 
            onClick={logout} 
            className="btn btn-secondary" 
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.8rem',
              backgroundColor: 'var(--color-marfim)',
              borderColor: 'var(--color-marfim)'
            }}
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
      </header>

      {/* Notificação Popup Superior */}
      {notification && (
        <div style={{ 
          position: 'fixed',
          top: '80px',
          right: '24px',
          zIndex: 1000,
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(20,24,31,0.15)',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--shadow-lg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideIn 0.3s ease-out',
          borderLeft: notification.tipo === 'sucesso' ? '6px solid var(--color-azeitona)' : '6px solid var(--color-carmesim)'
        }}>
          {notification.tipo === 'sucesso' ? (
            <CheckCircle2 size={20} style={{ color: 'var(--color-azeitona)' }} />
          ) : (
            <XCircle size={20} style={{ color: 'var(--color-carmesim)' }} />
          )}
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{notification.msg}</span>
          
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}} />
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '30px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {pagina === 'catalogo' && (
          <Catalogo 
            onNavigateToGerenciamento={() => setPagina('gerenciamento')} 
            onSolicitarEmprestimo={handleSolicitarEmprestimo}
            onSolicitarReserva={handleSolicitarReserva}
          />
        )}

        {pagina === 'gerenciamento' && user?.papel === 'BIBLIOTECARIO' && (
          <GerenciamentoAcervo onVoltar={() => setPagina('catalogo')} />
        )}

        {pagina === 'emprestimos_admin' && user?.papel === 'BIBLIOTECARIO' && (
          <PainelBibliotecario />
        )}

        {pagina === 'dashboard_admin' && user?.papel === 'BIBLIOTECARIO' && (
          <DashboardAdmin />
        )}

        {pagina === 'meus_emprestimos' && user?.papel === 'USUARIO' && (
          <PainelLeitor />
        )}
      </main>
    </div>
  );
}

function MainRoutes() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid rgba(20, 24, 31, 0.1)',
          borderTopColor: 'var(--color-navy)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span className="mono" style={{ fontSize: '0.85rem' }}>Recuperando registros...</span>
        
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  if (!user) {
    if (view === 'register') {
      return <Register onNavigateToLogin={() => setView('login')} />;
    }
    return (
      <Login 
        onNavigateToRegister={() => setView('register')} 
        onLoginSuccess={() => console.log('Login efetuado com sucesso!')} 
      />
    );
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainRoutes />
    </AuthProvider>
  );
}
