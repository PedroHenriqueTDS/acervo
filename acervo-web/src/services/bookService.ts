import api from './api';

export interface Livro {
  id: string;
  titulo: string;
  autor: string;
  isbn: string;
  categoria: string;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  dataCadastro: string;
}

export interface LivroRequest {
  titulo: string;
  autor: string;
  isbn: string;
  categoria: string;
  quantidadeTotal: number;
}

export const bookService = {
  listar: async (termo?: string): Promise<Livro[]> => {
    const params = termo ? { termo } : {};
    const response = await api.get<Livro[]>('/livros', { params });
    return response.data;
  },

  buscarPorId: async (id: string): Promise<Livro> => {
    const response = await api.get<Livro>(`/livros/${id}`);
    return response.data;
  },

  criar: async (livro: LivroRequest): Promise<Livro> => {
    const response = await api.post<Livro>('/livros', livro);
    return response.data;
  },

  atualizar: async (id: string, livro: LivroRequest): Promise<Livro> => {
    const response = await api.put<Livro>(`/livros/${id}`, livro);
    return response.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/livros/${id}`);
  }
};
