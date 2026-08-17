import { useEffect, useState } from 'react';
import { getPartido, actualizarPartido } from '../lib/api.js';
import PartidoForm from './PartidoForm.jsx';

export default function EditarPartido({ partidoId, onGuardado, onCancelar }) {
  const [partido, setPartido] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getPartido(partidoId)
      .then(setPartido)
      .catch((e) => setError(e.message));
  }, [partidoId]);

  async function handleGuardar(payload) {
    await actualizarPartido(partidoId, payload);
    onGuardado?.();
  }

  if (error) return <p className="mensaje-error">{error}</p>;
  if (!partido) return <p>Cargando partido…</p>;

  return (
    <PartidoForm
      partidoInicial={partido}
      onGuardar={handleGuardar}
      textoBoton="Guardar cambios"
      textoExito="Partido actualizado."
      onCancelar={onCancelar}
    />
  );
}
