import { useEffect, useState } from 'react';
import { getJugadores, getPartidos } from '../lib/api.js';
import { sortearAmbosCriterios, CANTIDADES_VALIDAS } from '../lib/sorteo.js';

function BloqueResultado({ titulo, resultado, sufijo }) {
  return (
    <div className="sorteo-bloque">
      <h3 className="sorteo-bloque-titulo">{titulo}</h3>
      <div className="sorteo-equipos-grid">
        <div className="sorteo-equipo">
          <h4>Equipo A</h4>
          <p className="sorteo-promedio">
            Promedio: {resultado.promedioA.toFixed(1)}
            {sufijo}
          </p>
          <ul>
            {resultado.equipoA.map((j) => (
              <li key={j.id}>{j.nombre}</li>
            ))}
          </ul>
        </div>
        <div className="sorteo-equipo">
          <h4>Equipo B</h4>
          <p className="sorteo-promedio">
            Promedio: {resultado.promedioB.toFixed(1)}
            {sufijo}
          </p>
          <ul>
            {resultado.equipoB.map((j) => (
              <li key={j.id}>{j.nombre}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function SorteoEquipos() {
  const [jugadores, setJugadores] = useState(null);
  const [partidos, setPartidos] = useState(null);
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getJugadores()
      .then(setJugadores)
      .catch((e) => setError(e.message));
    getPartidos()
      .then(setPartidos)
      .catch((e) => setError(e.message));
  }, []);

  function toggleJugador(id) {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setResultado(null);
  }

  function handleSortear() {
    setError('');
    const elegidos = jugadores.filter((j) => seleccionados.has(j.id));

    if (!CANTIDADES_VALIDAS.includes(elegidos.length)) {
      setError(
        `Elegí exactamente ${CANTIDADES_VALIDAS.join(', ')} jugadores (para armar 5 vs 5, 6 vs 6 o 7 vs 7). Ahora mismo elegiste ${elegidos.length}.`
      );
      return;
    }

    setResultado(sortearAmbosCriterios(elegidos, partidos));
  }

  if (!jugadores || !partidos) return <p>Cargando jugadores…</p>;

  const activos = jugadores.filter((j) => j.activo);

  return (
    <div className="card">
      <div className="campo">
        <label>
          Jugadores disponibles ({seleccionados.size} elegidos — tiene que
          ser 10, 12 o 14)
        </label>
        {activos.length === 0 ? (
          <div className="vacio">No hay jugadores activos.</div>
        ) : (
          <div className="sorteo-lista">
            {activos.map((j) => (
              <label key={j.id} className="sorteo-item">
                <input
                  type="checkbox"
                  checked={seleccionados.has(j.id)}
                  onChange={() => toggleJugador(j.id)}
                />
                {j.nombre}
              </label>
            ))}
          </div>
        )}
      </div>

      {error && <p className="mensaje-error">{error}</p>}

      <button type="button" className="btn" onClick={handleSortear}>
        Sortear equipos
      </button>

      {resultado && (
        <div className="sorteo-resultado">
          <BloqueResultado
            titulo="Por media"
            resultado={resultado.porMedia}
            sufijo=""
          />
          <BloqueResultado
            titulo="Por winrate"
            resultado={resultado.porWinrate}
            sufijo="%"
          />
          <button
            type="button"
            className="btn btn-secundario"
            onClick={handleSortear}
          >
            Sortear de nuevo
          </button>
        </div>
      )}
    </div>
  );
}