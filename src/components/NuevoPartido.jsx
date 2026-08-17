import { useEffect, useState } from 'react';
import { getJugadores, crearPartido } from '../lib/api.js';

function hoyISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10);
}

export default function NuevoPartido({ onCreado }) {
  const [jugadores, setJugadores] = useState(null);
  const [asignaciones, setAsignaciones] = useState({}); // { [jugadorId]: 'A' | 'B' }
  const [fecha, setFecha] = useState(hoyISO());
  const [cancha, setCancha] = useState('');
  const [golesA, setGolesA] = useState('');
  const [golesB, setGolesB] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    getJugadores()
      .then((js) => setJugadores(js.filter((j) => j.activo)))
      .catch((e) => setError(e.message));
  }, []);

  function toggle(equipo, id) {
    setAsignaciones((prev) => {
      const next = { ...prev };
      if (next[id] === equipo) {
        delete next[id];
      } else {
        next[id] = equipo;
      }
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setOk(false);

    const equipoA = Object.entries(asignaciones)
      .filter(([, eq]) => eq === 'A')
      .map(([id]) => Number(id));
    const equipoB = Object.entries(asignaciones)
      .filter(([, eq]) => eq === 'B')
      .map(([id]) => Number(id));

    if (equipoA.length === 0 || equipoB.length === 0) {
      setError('Asigná al menos un jugador a cada equipo.');
      return;
    }
    if (golesA === '' || golesB === '') {
      setError('Cargá el resultado de ambos equipos.');
      return;
    }

    setGuardando(true);
    try {
      await crearPartido({
        fecha,
        cancha: cancha.trim() || null,
        golesEquipoA: Number(golesA),
        golesEquipoB: Number(golesB),
        equipoA,
        equipoB,
      });
      setOk(true);
      setAsignaciones({});
      setCancha('');
      setGolesA('');
      setGolesB('');
      onCreado?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  if (!jugadores) return <p>Cargando jugadores…</p>;

  if (jugadores.length === 0) {
    return (
      <div className="vacio">
        Necesitás cargar jugadores primero, en la pestaña "Jugadores".
      </div>
    );
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="fila">
        <div className="campo">
          <label>Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <div className="campo">
          <label>Cancha (opcional)</label>
          <input
            placeholder="Ej: Cancha del club"
            value={cancha}
            onChange={(e) => setCancha(e.target.value)}
          />
        </div>
      </div>

      <div className="equipos-grid">
        <div className="equipo-col">
          <h3>Equipo A</h3>
          <div className="lista-jugadores">
            {jugadores.map((j) => {
              const asignadoOtro =
                asignaciones[j.id] && asignaciones[j.id] !== 'A';
              return (
                <label
                  className={`jugador-item ${asignadoOtro ? 'deshabilitado' : ''}`}
                  key={j.id}
                >
                  <input
                    type="checkbox"
                    disabled={asignadoOtro}
                    checked={asignaciones[j.id] === 'A'}
                    onChange={() => toggle('A', j.id)}
                  />
                  {j.nombre}
                </label>
              );
            })}
          </div>
        </div>

        <div className="equipo-col">
          <h3>Equipo B</h3>
          <div className="lista-jugadores">
            {jugadores.map((j) => {
              const asignadoOtro =
                asignaciones[j.id] && asignaciones[j.id] !== 'B';
              return (
                <label
                  className={`jugador-item ${asignadoOtro ? 'deshabilitado' : ''}`}
                  key={j.id}
                >
                  <input
                    type="checkbox"
                    disabled={asignadoOtro}
                    checked={asignaciones[j.id] === 'B'}
                    onChange={() => toggle('B', j.id)}
                  />
                  {j.nombre}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fila">
        <div className="campo">
          <label>Goles equipo A</label>
          <input
            type="number"
            min="0"
            value={golesA}
            onChange={(e) => setGolesA(e.target.value)}
          />
        </div>
        <div className="campo">
          <label>Goles equipo B</label>
          <input
            type="number"
            min="0"
            value={golesB}
            onChange={(e) => setGolesB(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="mensaje-error">{error}</p>}

      <button className="btn" disabled={guardando}>
        {guardando ? 'Guardando…' : 'Guardar partido'}
      </button>

      {ok && <p className="mensaje-ok">Partido cargado con éxito.</p>}
    </form>
  );
}
