import { crearPartido } from '../lib/api.js';
import PartidoForm from './PartidoForm.jsx';

export default function NuevoPartido({ onCreado }) {
  async function handleGuardar(payload) {
    await crearPartido(payload);
    onCreado?.();
  }

  return (
    <PartidoForm
      onGuardar={handleGuardar}
      textoBoton="Guardar partido"
      textoExito="Partido cargado con éxito."
    />
  );
}
