import React from 'react';

interface LombadaLivroProps {
  titulo: string;
  autor: string;
  isbn: string;
  categoria: string;
  style?: React.CSSProperties;
}

const CORES_LOMBADA = [
  '#540B0E', // Vinho Escuro
  '#2C3E50', // Azul Ficha/Navy
  '#1C3F24', // Verde Floresta
  '#6D4C41', // Marrom Couro
  '#D4AC0D', // Ouro Latão
  '#4A235A', // Roxo Imperial
  '#1B4F72', // Azul Cobalto
  '#2E4053'  // Cinza Grafite
];

export default function LombadaLivro({ titulo, autor, isbn, categoria, style }: LombadaLivroProps) {
  // Gera uma cor consistente para o mesmo ISBN
  const obterCor = (codigoIsbn: string) => {
    let hash = 0;
    const cleanIsbn = codigoIsbn.replace(/[^0-9X]/gi, '');
    for (let i = 0; i < cleanIsbn.length; i++) {
      hash = cleanIsbn.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % CORES_LOMBADA.length;
    return CORES_LOMBADA[index];
  };

  const corFundo = obterCor(isbn);
  const inicial = titulo ? titulo.trim().charAt(0).toUpperCase() : '?';

  return (
    <div 
      className="lombada-fallback" 
      style={{ 
        backgroundColor: corFundo,
        height: '240px',
        width: '160px',
        ...style 
      }}
    >
      {/* Detalhe de frisos dourados no topo */}
      <div style={{ 
        borderTop: '2px solid rgba(255, 255, 255, 0.25)', 
        borderBottom: '2px solid rgba(255, 255, 255, 0.25)', 
        height: '6px', 
        opacity: 0.7 
      }} />

      {/* Inicial em destaque com tipografia serifada retrô */}
      <div className="flex-center" style={{ 
        flex: 1, 
        fontFamily: 'var(--font-serif)',
        fontSize: '4.5rem',
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.15)',
        textShadow: '1px 1px 0px rgba(0,0,0,0.2)',
        userSelect: 'none',
        lineHeight: 1
      }}>
        {inicial}
      </div>

      {/* Metadados e Título */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
        <div 
          className="lombada-titulo" 
          style={{ 
            fontSize: '0.85rem', 
            maxHeight: '48px', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            color: '#FFFFFF'
          }}
          title={titulo}
        >
          {titulo}
        </div>
        <div 
          style={{ 
            fontSize: '0.7rem', 
            opacity: 0.8, 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            color: '#FFFFFF',
            fontFamily: 'var(--font-sans)'
          }}
          title={autor}
        >
          {autor}
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderTop: '1px solid rgba(255,255,255,0.15)', 
          paddingTop: '4px', 
          marginTop: '2px' 
        }}>
          <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            {categoria}
          </span>
          <span className="mono" style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>
            {isbn.substring(Math.max(0, isbn.length - 5))}
          </span>
        </div>
      </div>
    </div>
  );
}
