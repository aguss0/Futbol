import { useEffect, useState } from 'react';
import { getJugadores } from '../lib/api.js';
import CampoFormacion, { POSICIONES } from './CampoFormacion.jsx';

function hoyISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10);
}

const VACIO = Object.fromEntries(POSICIONES.map((p) => [p.key, null]));

function armarEquipoInicial(participaciones, equipo, jugadoresPorId) {
  const ids = participaciones
    .filter((p) => p.equipo === equipo)
    .map((p) => p.jugadorId);
  const obj = { ...VACIO };
  POSICIONES.forEach(({ key }, i) => {
    const id = ids[i];
    if (id && jugadoresPorId[id]) obj[key] = jugadoresPorId[id];
  });
  return obj;
}

export default function PartidoForm({
  partidoInicial,
  onGuardar,
  textoBoton = 'Guardar partido',
  textoExito = 'Partido guardado con éxito.',
  onCancelar,
}) {
  const [jugadores, setJugadores] = useState(null);
  const [equipoA, setEquipoA] = useState(VACIO);
  const [equipoB, setEquipoB] = useState(VACIO);
  const [fecha, setFecha] = useState(
    partidoInicial ? partidoInicial.fecha.slice(0, 10) : hoyISO()
  );
  const [cancha, setCancha] = useState(partidoInicial?.cancha || '');
  const [golesA, setGolesA] = useState(
    partidoInicial ? String(partidoInicial.golesEquipoA) : ''
  );
  const [golesB, setGolesB] = useState(
    partidoInicial ? String(partidoInicial.golesEquipoB) : ''
  );
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [slotAbierto, setSlotAbierto] = useState(null); // { equipo, key } | null

  useEffect(() => {
    getJugadores()
      .then(setJugadores)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (jugadores && partidoInicial) {
      const porId = Object.fromEntries(jugadores.map((j) => [j.id, j]));
      setEquipoA(armarEquipoInicial(partidoInicial.participaciones, 'A', porId));
      setEquipoB(armarEquipoInicial(partidoInicial.participaciones, 'B', porId));
    }
  }, [jugadores, partidoInicial]);

  function idsUsados(exceptEquipo, exceptKey) {
    const usados = new Set();
    POSICIONES.forEach(({ key }) => {
      if (!(exceptEquipo === 'A' && key === exceptKey) && equipoA[key]) {
        usados.add(equipoA[key].id);
      }
      if (!(exceptEquipo === 'B' && key === exceptKey) && equipoB[key]) {
        usados.add(equipoB[key].id);
      }
    });
    return usados;
  }

  function opcionesPara(equipo, key) {
    const usados = idsUsados(equipo, key);
    const valorActualId =
      (equipo === 'A' ? equipoA[key] : equipoB[key])?.id ?? null;
    return jugadores.filter(
      (j) => (j.activo || j.id === valorActualId) && !usados.has(j.id)
    );
  }

  function handleSelect(equipo, key, jugadorId) {
    const jugador = jugadorId
      ? jugadores.find((j) => j.id === Number(jugadorId))
      : null;
    const setter = equipo === 'A' ? setEquipoA : setEquipoB;
    setter((prev) => ({ ...prev, [key]: jugador || null }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setOk(false);

    const idsA = POSICIONES.map(({ key }) => equipoA[key]?.id).filter(Boolean);
    const idsB = POSICIONES.map(({ key }) => equipoB[key]?.id).filter(Boolean);

    if (idsA.length < 5 || idsB.length < 5) {
      setError('Completá los 5 jugadores de cada equipo.');
      return;
    }
    if (golesA === '' || golesB === '') {
      setError('Cargá el resultado de ambos equipos.');
      return;
    }

    setGuardando(true);
    try {
      await onGuardar({
        fecha,
        cancha: cancha.trim() || null,
        golesEquipoA: Number(golesA),
        golesEquipoB: Number(golesB),
        equipoA: idsA,
        equipoB: idsB,
      });
      setOk(true);
      if (!partidoInicial) {
        setEquipoA(VACIO);
        setEquipoB(VACIO);
        setCancha('');
        setGolesA('');
        setGolesB('');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  if (!jugadores) return <p>Cargando jugadores…</p>;

  const activos = jugadores.filter((j) => j.activo);
  if (!partidoInicial && activos.length < 10) {
    return (
      <div className="vacio">
        Necesitás al menos 10 jugadores activos para armar los dos equipos
        (tenés {activos.length}). Cargá más en la pestaña "Jugadores".
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

      <div className="campo-contenedor">
        <div className="campo-wrap">
          <CampoFormacion
            seleccionA={equipoA}
            seleccionB={equipoB}
            onSlotClick={(equipo, key) => setSlotAbierto({ equipo, key })}
          />
        </div>

        {slotAbierto && (
          <div
            className="selector-overlay"
            onClick={() => setSlotAbierto(null)}
          >
            <div className="selector-panel" onClick={(e) => e.stopPropagation()}>
              <div className="selector-header">
                <span>
                  <span className={`chip-color pechera-${slotAbierto.equipo.toLowerCase()}`} />{' '}
                  Equipo {slotAbierto.equipo} ·{' '}
                  {POSICIONES.find((p) => p.key === slotAbierto.key).label}
                </span>
                <button
                  type="button"
                  className="selector-cerrar"
                  onClick={() => setSlotAbierto(null)}
                >
                  ✕
                </button>
              </div>

              <div className="selector-lista">
                {opcionesPara(slotAbierto.equipo, slotAbierto.key).map((j) => (
                  <button
                    type="button"
                    key={j.id}
                    className="selector-item"
                    onClick={() => {
                      handleSelect(slotAbierto.equipo, slotAbierto.key, j.id);
                      setSlotAbierto(null);
                    }}
                  >
                    {j.nombre}
                    {!j.activo ? ' (inactivo)' : ''}
                  </button>
                ))}
                {opcionesPara(slotAbierto.equipo, slotAbierto.key).length === 0 && (
                  <p className="selector-vacio">No hay jugadores disponibles</p>
                )}
              </div>

              {(slotAbierto.equipo === 'A' ? equipoA : equipoB)[slotAbierto.key] && (
                <button
                  type="button"
                  className="selector-quitar"
                  onClick={() => {
                    handleSelect(slotAbierto.equipo, slotAbierto.key, '');
                    setSlotAbierto(null);
                  }}
                >
                  Quitar jugador
                </button>
              )}
            </div>
          </div>
        )}
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

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button className="btn" disabled={guardando}>
          {guardando ? 'Guardando…' : textoBoton}
        </button>
        {onCancelar && (
          <button
            type="button"
            className="btn btn-secundario"
            onClick={onCancelar}
          >
            Cancelar
          </button>
        )}
      </div>

      {ok && <p className="mensaje-ok">{textoExito}</p>}
    </form>
  );
}
