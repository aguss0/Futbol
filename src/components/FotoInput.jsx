import { useRef, useState } from 'react';
import { subirFoto } from '../lib/api.js';

export default function FotoInput({ fotoUrl, onGuardar }) {
  const inputRef = useRef(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');

  async function handleArchivo(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo después
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Elegí un archivo de imagen (jpg, png, etc.)');
      return;
    }

    setError('');
    setSubiendo(true);
    try {
      const url = await subirFoto(file);
      await onGuardar(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="foto-badge"
        onClick={() => inputRef.current?.click()}
        disabled={subiendo}
        title={fotoUrl ? 'Cambiar foto' : 'Agregar foto'}
      >
        {subiendo ? '…' : '📷'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleArchivo}
      />
      {error && <p className="mensaje-error foto-error">{error}</p>}
    </>
  );
}