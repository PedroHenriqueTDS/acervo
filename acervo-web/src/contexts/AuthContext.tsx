import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '../services/api';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: 'USUARIO' | 'BIBLIOTECARIO';
  dataCadastro: string;
}

interface LoginResponse {
  token: string;
  tipoToken: string;
  usuario: Usuario;
}

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string, papel?: 'USUARIO' | 'BIBLIOTECARIO') => Promise<void>;
  logout: () => void;
  limparErro: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Carrega o usuário e o token salvos no localStorage ao iniciar a aplicação
    const salvoToken = localStorage.getItem('acervo_token');
    const salvoUser = localStorage.getItem('acervo_user');

    if (salvoToken && salvoUser) {
      setToken(salvoToken);
      setUser(JSON.parse(salvoUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, senha });
      const { token, usuario } = response.data;

      localStorage.setItem('acervo_token', token);
      localStorage.setItem('acervo_user', JSON.stringify(usuario));

      setToken(token);
      setUser(usuario);
    } catch (err: any) {
      console.error(err);
      let msg = 'Falha ao realizar login. Verifique suas credenciais.';
      if (err.response?.data?.mensagem) {
        msg = err.response.data.mensagem;
      }
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (nome: string, email: string, senha: string, papel: 'USUARIO' | 'BIBLIOTECARIO' = 'USUARIO') => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/register', { nome, email, senha, papel });
    } catch (err: any) {
      console.error(err);
      let msg = 'Falha ao realizar cadastro. Tente outro e-mail.';
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.campos && Object.keys(errorData.campos).length > 0) {
          const errosCampos = Object.values(errorData.campos).join(', ');
          msg = `${errorData.mensagem}: ${errosCampos}`;
        } else if (errorData.mensagem) {
          msg = errorData.mensagem;
        }
      }
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('acervo_token');
    localStorage.removeItem('acervo_user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const limparErro = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, limparErro }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
