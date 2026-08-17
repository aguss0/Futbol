import { useEffect, useState } from 'react';
import { getJugadores, crearJugador, toggleJugador } from '../lib/api.js';

export default function Jugadores() {
  const [jugadores, setJugadores] = useState(null);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  function cargar() {
    getJugadores()
      .then(setJugadores)
      .catch((e) => setError(e.message));
  }

  useEffect(cargar, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setGuardando(true);
    setError('');
    try {
      await crearJugador(nombre);
      setNombre('');
      cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleToggle(j) {
    try {
      await toggleJugador(j.id, !j.activo);
      cargar();
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

      {!jugadores ? (
        <p>Cargando…</p>
      ) : jugadores.length === 0 ? (
        <div className="vacio">Todavía no cargaste jugadores.</div>
      ) : (
        jugadores.map((j) => (
          <div className="jugador-row" key={j.id}>
            <span className={`nombre ${!j.activo ? 'inactivo' : ''}`}>
              {j.nombre}
            </span>
            <button
              className="btn-secundario btn"
              onClick={() => handleToggle(j)}
            >
              {j.activo ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
