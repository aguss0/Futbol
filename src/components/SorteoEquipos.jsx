import { useEffect, useState } from 'react';
import { getJugadores, getPartidos } from '../lib/api.js';
import { balancearEquipos } from '../lib/sorteo.js';

export default function SorteoEquipos() {
  const [jugadores, setJugadores] = useState(null);
  const [partidos, setPartidos] = useState(null);
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [criterio, setCriterio] = useState('media');
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
    if (elegidos.length < 2) {
      setError('Elegí al menos 2 jugadores.');
      return;
    }
    setResultado(balancearEquipos(elegidos, partidos, criterio));
  }

  if (!jugadores || !partidos) return <p>Cargando jugadores…</p>;

  const activos = jugadores.filter((j) => j.activo);

  return (
    <div className="card">
      <div className="campo">
        <label>Criterio de balance</label>
        <select
          value={criterio}
          onChange={(e) => {
            setCriterio(e.target.value);
            setResultado(null);
          }}
        >
          <option value="media">Balancear por media</option>
          <option value="winrate">Balancear por winrate</option>
        </select>
      </div>

      <div className="campo">
        <label>Jugadores disponibles ({seleccionados.size} elegidos)</label>
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
          <div className="sorteo-equipos-grid">
            <div className="sorteo-equipo">
              <h3>Equipo A</h3>
              <p className="sorteo-promedio">
                {criterio === 'media' ? 'Media promedio' : 'Winrate promedio'}:{' '}
                {resultado.promedioA.toFixed(1)}
                {criterio === 'winrate' ? '%' : ''}
              </p>
              <ul>
                {resultado.equipoA.map((j) => (
                  <li key={j.id}>{j.nombre}</li>
                ))}
              </ul>
            </div>
            <div className="sorteo-equipo">
              <h3>Equipo B</h3>
              <p className="sorteo-promedio">
                {criterio === 'media' ? 'Media promedio' : 'Winrate promedio'}:{' '}
                {resultado.promedioB.toFixed(1)}
                {criterio === 'winrate' ? '%' : ''}
              </p>
              <ul>
                {resultado.equipoB.map((j) => (
                  <li key={j.id}>{j.nombre}</li>
                ))}
              </ul>
            </div>
          </div>
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