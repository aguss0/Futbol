import { useEffect, useState } from 'react';
import { getPartidos, eliminarPartido } from '../lib/api.js';
import TicketPartido from './TicketPartido.jsx';
import TablaGoleadores from './TablaGoleadores.jsx';

export default function Inicio({ onEditar, refrescarKey }) {
  const [partidos, setPartidos] = useState(null);
  const [error, setError] = useState('');
  const [mostrarTodos, setMostrarTodos] = useState(false);

  function cargar() {
    getPartidos()
      .then(setPartidos)
      .catch((e) => setError(e.message));
  }

  useEffect(cargar, [refrescarKey]);

  async function handleEliminar(id) {
    const confirmado = window.confirm(
      '¿Seguro que querés eliminar este partido? No se puede deshacer.'
    );
    if (!confirmado) return;
    try {
      await eliminarPartido(id);
      cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  if (error) return <p className="mensaje-error">{error}</p>;
  if (!partidos) return <p>Cargando partidos…</p>;

  const ultimos5 = partidos.slice(0, 5);
  const resto = partidos.slice(5);

  return (
    <>
      <div className="seccion" style={{ marginTop: 0 }}>
        <h2>Últimos 5 partidos</h2>
        {ultimos5.length === 0 ? (
          <div className="vacio">
            Todavía no hay partidos cargados. Andá a "Nuevo partido" y
            arrancá el histórico.
          </div>
        ) : (
          ultimos5.map((p) => (
            <TicketPartido
              key={p.id}
              partido={p}
              onEditar={onEditar}
              onEliminar={handleEliminar}
            />
          ))
          
        )}
      </div>

      <TablaGoleadores partidos={partidos} />
      
      {resto.length > 0 && (
        <div className="seccion">
          <div className="seccion-header">
            <h2>Histórico completo</h2>
            <button
              type="button"
              className="btn-secundario btn btn-chico"
              onClick={() => setMostrarTodos((v) => !v)}
            >
              {mostrarTodos
                ? 'Ocultar'
                : `Ver todos (${partidos.length})`}
            </button>
          </div>
          {mostrarTodos &&
            resto.map((p) => (
              <TicketPartido
                key={p.id}
                partido={p}
                onEditar={onEditar}
                onEliminar={handleEliminar}
              />
            ))}
        </div>
      )}
    </>
  );
}
