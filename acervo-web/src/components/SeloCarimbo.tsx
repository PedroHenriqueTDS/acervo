import React from 'react';

type StatusType = 'ATIVO' | 'DEVOLVIDO' | 'ATRASADO' | 'DISPONIVEL' | 'ESGOTADO' | 'RESERVADO' | 'AGUARDANDO' | 'NOTIFICADO' | 'EXPIRADA' | 'CONCLUIDA';

interface SeloCarimboProps {
  status: StatusType | string;
  texto?: string;
  style?: React.CSSProperties;
}

export default function SeloCarimbo({ status, texto, style }: SeloCarimboProps) {
  const normalizarStatus = (st: string): { classe: string; label: string } => {
    switch (st.toUpperCase()) {
      case 'ATIVO':
        return { classe: 'selo-ativo', label: 'Empréstimo Ativo' };
      case 'DEVOLVIDO':
        return { classe: 'selo-devolvido', label: 'Devolvido' };
      case 'DISPONIVEL':
        return { classe: 'selo-devolvido', label: 'Disponível' };
      case 'ATRASADO':
        return { classe: 'selo-atrasado', label: 'Atrasado' };
      case 'ESGOTADO':
        return { classe: 'selo-atrasado', label: 'Esgotado' };
      case 'RESERVADO':
        return { classe: 'selo-reservado', label: 'Reservado' };
      case 'AGUARDANDO':
        return { classe: 'selo-ativo', label: 'Fila de Espera' };
      case 'NOTIFICADO':
        return { classe: 'selo-reservado', label: 'Notificado (48h)' };
      case 'EXPIRADA':
        return { classe: 'selo-ativo', label: 'Reserva Expirada' };
      case 'CONCLUIDA':
        return { classe: 'selo-devolvido', label: 'Reserva Concluída' };
      default:
        return { classe: 'selo-ativo', label: st };
    }
  };

  const { classe, label } = normalizarStatus(status);
  const textoExibido = texto || label;

  return (
    <span 
      className={`selo-carimbo ${classe}`} 
      style={style}
      title={textoExibido}
    >
      {textoExibido}
    </span>
  );
}
