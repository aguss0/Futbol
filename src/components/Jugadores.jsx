import { useEffect, useState } from 'react';
import {
  getJugadores,
  crearJugador,
  actualizarJugador,
  getPartidos,
} from '../lib/api.js';
import { calcularStats } from '../lib/stats.js';
import MediaBadge from './MediaBadge.jsx';
import GraficoForma from './GraficoForma.jsx';

export default function Jugadores() {
  const [jugadores, setJugadores] = useState(null);
  const [partidos, setPartidos] = useState(null);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [expandidoId, setExpandidoId] = useState(null);

  function cargarJugadores() {
    getJugadores()
      .then(setJugadores)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    cargarJugadores();
    getPartidos()
      .then(setPartidos)
      .catch((e) => setError(e.message));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setGuardando(true);
    setError('');
    try {
      await crearJugador(nombre);
      setNombre('');
      cargarJugadores();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleToggleActivo(j) {
    try {
      await actualizarJugador(j.id, { activo: !j.activo });
      cargarJugadores();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleMedia(j, nuevaMedia) {
    try {
      await actualizarJugador(j.id, { media: nuevaMedia });
      cargarJugadores();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="card">
      <form className="form-inline" onSubmit={handleSubmit}>
        <input
          placeholder="Nombre del jugador"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button className="btn" disabled={guardando}>
          {guardando ? 'Agregando…' : 'Agregar'}
        </button>
      </form>

      {error && <p className="mensaje-error">{error}</p>}

      {!jugadores || !partidos ? (
        <p>Cargando…</p>
      ) : jugadores.length === 0 ? (
        <div className="vacio">Todavía no cargaste jugadores.</div>
      ) : (
        jugadores.map((j) => {
          const abierto = expandidoId === j.id;
          const stats = abierto ? calcularStats(j.id, partidos) : null;

          return (
            <div key={j.id} className="jugador-bloque">
              <div className="jugador-row">
                <button
                  type="button"
                  className="jugador-nombre-btn"
                  onClick={() => setExpandidoId(abierto ? null : j.id)}
                >
                  <span className={`chevron ${abierto ? 'abierto' : ''}`}>
                    ›
                  </span>
                  <span className={`nombre ${!j.activo ? 'inactivo' : ''}`}>
                    {j.nombre}
                  </span>
                </button>

                <div className="jugador-row-acciones">
                  <MediaBadge
                    media={j.media}
                    onGuardar={(n) => handleMedia(j, n)}
                  />
                  <button
                    className="btn-secundario btn"
                    onClick={() => handleToggleActivo(j)}
                  >
                    {j.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>

              {abierto && (
                <div className="stats-panel">
                  {stats.pj === 0 ? (
                    <p className="stats-vacio">
                      Todavía no jugó ningún partido.
                    </p>
                  ) : (
                    <>
                      <div className="stats-grid">
                        <div className="stats-item">
                          <span className="stats-valor">{stats.pj}</span>
                          <span className="stats-label">PJ</span>
                        </div>
                        <div className="stats-item">
                          <span className="stats-valor">{stats.pg}</span>
                          <span className="stats-label">PG</span>
                        </div>
                        <div className="stats-item">
                          <span className="stats-valor">{stats.pe}</span>
                          <span className="stats-label">PE</span>
                        </div>
                        <div className="stats-item">
                          <span className="stats-valor">{stats.pp}</span>
                          <span className="stats-label">PP</span>
                        </div>
                        <div className="stats-item">
                          <span className="stats-valor">{stats.winrate}%</span>
                          <span className="stats-label">Winrate</span>
                        </div>
                      </div>

                      <div className="stats-forma">
                        <span className="stats-forma-label">
                          Últimos {stats.ultimos5.length}
                        </span>
                        <GraficoForma detalle={stats.ultimos5} />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
