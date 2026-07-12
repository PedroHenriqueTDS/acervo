import api from './api';
import { Livro } from './bookService';
import { Usuario } from '../contexts/AuthContext';

export interface Emprestimo {
  id: string;
  usuario: Usuario;
  livro: Livro;
  dataEmprestimo: string;
  dataPrevistaDevolucao: string;
  dataDevolucaoReal: string | null;
  status: 'ATIVO' | 'DEVOLVIDO' | 'ATRASADO';
  valorMulta: number;
}

export const loanService = {
  solicitar: async (livroId: string): Promise<Emprestimo> => {
    const response = await api.post<Emprestimo>('/emprestimos', { livroId });
    return response.data;
  },

  devolver: async (id: string): Promise<Emprestimo> => {
    const response = await api.patch<Emprestimo>(`/emprestimos/${id}/devolver`);
    return response.data;
  },

  listarMeus: async (): Promise<Emprestimo[]> => {
    const response = await api.get<Emprestimo[]>('/emprestimos/meus');
    return response.data;
  },

  listarTodos: async (): Promise<Emprestimo[]> => {
    const response = await api.get<Emprestimo[]>('/emprestimos');
    return response.data;
  },

  listarAtrasados: async (): Promise<Emprestimo[]> => {
    const response = await api.get<Emprestimo[]>('/emprestimos/atrasados');
    return response.data;
  }
};
