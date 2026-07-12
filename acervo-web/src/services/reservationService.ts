import api from './api';
import { Livro } from './bookService';
import { Usuario } from '../contexts/AuthContext';
import { Emprestimo } from './loanService';

export interface Reserva {
  id: string;
  usuario: Usuario;
  livro: Livro;
  dataReserva: string;
  posicaoFila: number;
  status: 'AGUARDANDO' | 'NOTIFICADO' | 'EXPIRADA' | 'CONCLUIDA';
  dataNotificacao: string | null;
}

export const reservationService = {
  solicitar: async (livroId: string): Promise<Reserva> => {
    const response = await api.post<Reserva>('/reservas', { livroId });
    return response.data;
  },

  confirmar: async (id: string): Promise<Emprestimo> => {
    const response = await api.post<Emprestimo>(`/reservas/${id}/confirmar`);
    return response.data;
  },

  listarMinhas: async (): Promise<Reserva[]> => {
    const response = await api.get<Reserva[]>('/reservas/minhas');
    return response.data;
  }
};
