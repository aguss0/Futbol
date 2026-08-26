import { useEffect, useState } from 'react';
import {
  getJugadores,
  crearJugador,
  actualizarJugador,
  eliminarJugador,
  getPartidos,
} from '../lib/api.js';
import { calcularStats } from '../lib/stats.js';
import MediaBadge from './MediaBadge.jsx';
import FotoInput from './FotoInput.jsx';
import EquipoNacionalidadInput from './EquipoNacionalidadInput.jsx';
import UltimosResultados from './UltimosResultados.jsx';
import CartaJugador from './CartaJugador.jsx';

export default function Jugadores() {
  const [jugadores, setJugadores] = useState(null);
  const [partidos, setPartidos] = useState(null);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [cartaAbierta, setCartaAbierta] = useState(null); // jugador | null

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

  async function handleEliminar(j) {
    const confirmado = window.confirm(
      `¿Seguro que querés eliminar a "${j.nombre}"? No se puede deshacer.`
    );
    if (!confirmado) return;
    setError('');
    try {
      await eliminarJugador(j.id);
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

  async function handleFoto(j, nuevaFotoUrl) {
    try {
      await actualizarJugador(j.id, { fotoUrl: nuevaFotoUrl });
      cargarJugadores();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDetalles(j, datos) {
    try {
      await actualizarJugador(j.id, datos);
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
          const stats = calcularStats(j.id, partidos);
          return (
            <div key={j.id} className="jugador-bloque">
              <div className="jugador-row">
                <span
                  className={`nombre ${!j.activo ? 'inactivo' : ''}`}
                  onClick={() => setCartaAbierta(j)}
                  title="Ver carta"
                >
                  {j.nombre}
                </span>

                <div className="jugador-stats-inline">
                  <div className="stats-mini">
                    <span className="stats-mini-valor">{stats.pj}</span>
                    <span className="stats-mini-label">PJ</span>
                  </div>
                  <div className="stats-mini">
                    <span className="stats-mini-valor">{stats.pg}</span>
                    <span className="stats-mini-label">G</span>
                  </div>
                  <div className="stats-mini">
                    <span className="stats-mini-valor">{stats.pp}</span>
                    <span className="stats-mini-label">P</span>
                  </div>
                  <div className="stats-mini">
                    <span className="stats-mini-valor">{stats.goles}</span>
                    <span className="stats-mini-label">GOL</span>
                  </div>
                  <UltimosResultados detalle={stats.ultimos5} />
                </div>

                <div className="jugador-row-acciones">
                  <FotoInput
                    fotoUrl={j.fotoUrl}
                    onGuardar={(url) => handleFoto(j, url)}
                  />
                  <EquipoNacionalidadInput
                    escudoUrl={j.escudoUrl}
                    posicion={j.posicion}
                    nacionalidad={j.nacionalidad}
                    onGuardar={(datos) => handleDetalles(j, datos)}
                  />
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
                  <button
                    type="button"
                    className="btn-secundario btn btn-eliminar"
                    onClick={() => handleEliminar(j)}
                    title="Eliminar jugador"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {cartaAbierta && (
        <div
          className="carta-overlay"
          onClick={() => setCartaAbierta(null)}
        >
          <div
            className="carta-contenedor"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative' }}
          >
            <button
              type="button"
              className="carta-cerrar"
              onClick={() => setCartaAbierta(null)}
            >
              ✕
            </button>
            <CartaJugador jugador={cartaAbierta} />
          </div>
        </div>
      )}
    </div>
  );
}