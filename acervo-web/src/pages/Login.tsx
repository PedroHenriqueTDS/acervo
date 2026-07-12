import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen } from 'lucide-react';

interface LoginProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: () => void;
}

export default function Login({ onNavigateToRegister, onLoginSuccess }: LoginProps) {
  const { login, error, limparErro } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) return;

    setLoadingLocal(true);
    try {
      await login(email, senha);
      onLoginSuccess();
    } catch (err) {
      // Erro é tratado no context e exibido via `error`
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="card-ficha" style={{ maxWidth: '440px', width: '100%', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="flex-center" style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--color-navy)', 
            color: 'var(--color-marfim)',
            margin: '0 auto 16px auto'
          }}>
            <BookOpen size={28} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '4px' }}>Ficha de Entrada</h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(20, 24, 31, 0.6)' }}>
            Faça login para consultar o acervo e gerenciar empréstimos.
          </p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: 'var(--color-carmesim-light)', 
            borderLeft: '4px solid var(--color-carmesim)',
            color: 'var(--color-carmesim)',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '0.9rem',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Endereço de E-mail</label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="senha">Senha de Acesso</label>
            <input
              id="senha"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
              }}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '20px' }}
            disabled={loadingLocal}
          >
            {loadingLocal ? 'Carimbando Entrada...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div style={{ textAlign: 'center', borderTop: '1px dashed rgba(20, 24, 31, 0.15)', paddingTop: '20px' }}>
          <p style={{ fontSize: '0.9rem', color: 'rgba(20, 24, 31, 0.7)' }}>
            Não tem uma ficha cadastrada?{' '}
            <button 
              onClick={onNavigateToRegister}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--color-carmesim)', 
                fontWeight: 600, 
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                textDecoration: 'underline'
              }}
            >
              Criar Novo Cadastro
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
