import { useState } from 'react';

export default function FotoInput({ fotoUrl, onGuardar }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(fotoUrl || '');
  const [guardando, setGuardando] = useState(false);

  async function confirmar() {
    const nueva = valor.trim();
    if (nueva === (fotoUrl || '')) {
      setEditando(false);
      return;
    }
    setGuardando(true);
    try {
      await onGuardar(nueva || null);
    } finally {
      setGuardando(false);
      setEditando(false);
    }
  }

  if (editando) {
    return (
      <input
        className="foto-input"
        type="url"
        placeholder="URL de la foto"
        autoFocus
        value={valor}
        disabled={guardando}
        onChange={(e) => setValor(e.target.value)}
        onBlur={confirmar}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.target.blur();
          if (e.key === 'Escape') {
            setValor(fotoUrl || '');
            setEditando(false);
          }
        }}
      />
    );
  }

  return (
    <button
      type="button"
      className="foto-badge"
      onClick={() => setEditando(true)}
      title={fotoUrl ? 'Cambiar foto' : 'Agregar foto'}
    >
      📷
    </button>
  );
}