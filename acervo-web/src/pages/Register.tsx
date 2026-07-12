import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus } from 'lucide-react';

interface RegisterProps {
  onNavigateToLogin: () => void;
}

export default function Register({ onNavigateToLogin }: RegisterProps) {
  const { register, error, limparErro } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !senha) return;

    setLoadingLocal(true);
    try {
      await register(nome, email, senha, 'USUARIO');
      setSucesso(true);
      setTimeout(() => {
        onNavigateToLogin();
      }, 2500);
    } catch (err) {
      // Erro é tratado no context
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
            <UserPlus size={28} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '4px' }}>Novo Cadastro</h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(20, 24, 31, 0.6)' }}>
            Cadastre-se para obter acesso completo ao sistema da biblioteca.
          </p>
        </div>

        {sucesso ? (
          <div style={{ 
            backgroundColor: 'var(--color-azeitona-light)', 
            borderLeft: '4px solid var(--color-azeitona)',
            color: 'var(--color-azeitona)',
            padding: '16px',
            borderRadius: '4px',
            fontSize: '0.95rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <h4 style={{ color: 'var(--color-azeitona)', marginBottom: '4px' }}>Cadastro Realizado!</h4>
            <p>Sua ficha de leitor foi criada. Redirecionando para login...</p>
          </div>
        ) : (
          <>
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
                <label htmlFor="nome">Nome Completo</label>
                <input
                  id="nome"
                  type="text"
                  className="input-field"
                  placeholder="Nome do Leitor"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                  }}
                  required
                />
              </div>

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

              <div className="form-group">
                <label htmlFor="senha">Senha de Acesso (Mín. 6 caracteres)</label>
                <input
                  id="senha"
                  type="password"
                  className="input-field"
                  placeholder="Mínimo 6 caracteres"
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
                {loadingLocal ? 'Gerando Ficha...' : 'Concluir Cadastro'}
              </button>
            </form>
          </>
        )}

        <div style={{ textAlign: 'center', borderTop: '1px dashed rgba(20, 24, 31, 0.15)', paddingTop: '20px' }}>
          <p style={{ fontSize: '0.9rem', color: 'rgba(20, 24, 31, 0.7)' }}>
            Já possui cadastro?{' '}
            <button 
              onClick={onNavigateToLogin}
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
              Fazer Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
