import { useState } from 'react';

function nivelDe(media) {
  if (media == null) return 'sin-media';
  if (media >= 85) return 'especial';
  if (media >= 75) return 'oro';
  if (media >= 65) return 'plata';
  return 'bronce';
}

export default function MediaBadge({ mediaMostrada, mediaInicial, onGuardar }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(mediaInicial ?? '');
  const [guardando, setGuardando] = useState(false);

  async function confirmar() {
    const n = valor === '' ? null : Number(valor);
    if (n !== null && (!Number.isInteger(n) || n < 1 || n > 99)) {
      setValor(mediaInicial ?? '');
      setEditando(false);
      return;
    }
    if (n === mediaInicial) {
      setEditando(false);
      return;
    }
    setGuardando(true);
    try {
      await onGuardar(n);
    } finally {
      setGuardando(false);
      setEditando(false);
    }
  }

  if (editando) {
    return (
      <input
        className="media-input"
        type="number"
        min="1"
        max="99"
        autoFocus
        value={valor}
        disabled={guardando}
        onChange={(e) => setValor(e.target.value)}
        onBlur={confirmar}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.target.blur();
          if (e.key === 'Escape') {
            setValor(mediaInicial ?? '');
            setEditando(false);
          }
        }}
      />
    );
  }

  return (
    <button
      type="button"
      className={`media-badge media-${nivelDe(mediaMostrada)}`}
      onClick={() => setEditando(true)}
      title="La media se calcula sola según los resultados. Click para ajustar la media inicial (excepción)."
    >
      {mediaMostrada ?? '—'}
    </button>
  );
}