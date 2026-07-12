import axios from 'axios';

// O base URL aponta para a rota relativa /api/v1 (que o Vite redireciona para http://localhost:8080/api/v1 via proxy)
// Em produção, assume a variável de ambiente VITE_API_URL
const API_URL = (import.meta as any).env?.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o token JWT em cada requisição se disponível
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('acervo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar expiração de sessão ou erro 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Se der 401 não autorizado, desloga o usuário localmente
      localStorage.removeItem('acervo_token');
      localStorage.removeItem('acervo_user');
      // Recarrega a página ou redireciona se necessário (opcional)
    }
    return Promise.reject(error);
  }
);

export default api;
