import { useEffect, useState } from 'react';
import { obtenerPaises } from '../lib/paises.js';

export default function EquipoNacionalidadInput({ equipo, nacionalidad, onGuardar }) {
  const [editando, setEditando] = useState(false);
  const [valorEquipo, setValorEquipo] = useState(equipo || '');
  const [valorNacionalidad, setValorNacionalidad] = useState(nacionalidad || '');
  const [guardando, setGuardando] = useState(false);
  const [paises, setPaises] = useState(null);
  const [errorPaises, setErrorPaises] = useState('');

  useEffect(() => {
    if (!editando || paises) return;
    obtenerPaises()
      .then(setPaises)
      .catch(() => setErrorPaises('No se pudo cargar la lista de países.'));
  }, [editando, paises]);

  async function confirmar() {
    const eq = valorEquipo.trim();
    const nac = valorNacionalidad || null;
    if (eq === (equipo || '') && nac === (nacionalidad || null)) {
      setEditando(false);
      return;
    }
    setGuardando(true);
    try {
      await onGuardar({ equipo: eq || null, nacionalidad: nac });
    } finally {
      setGuardando(false);
      setEditando(false);
    }
  }

  if (editando) {
    return (
      <div className="equipo-nac-overlay" onClick={() => confirmar()}>
        <div className="equipo-nac-panel" onClick={(e) => e.stopPropagation()}>
          <label>Club / equipo</label>
          <input
            type="text"
            placeholder="Ej: Boca Juniors"
            value={valorEquipo}
            disabled={guardando}
            onChange={(e) => setValorEquipo(e.target.value)}
            autoFocus
          />
          <label>Nacionalidad</label>
          {errorPaises ? (
            <p className="mensaje-error" style={{ marginTop: 0 }}>
              {errorPaises}
            </p>
          ) : (
            <select
              value={valorNacionalidad}
              disabled={guardando || !paises}
              onChange={(e) => setValorNacionalidad(e.target.value)}
            >
              <option value="">
                {paises ? 'Sin definir' : 'Cargando países…'}
              </option>
              {paises?.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.nombre}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            className="btn btn-chico"
            onClick={confirmar}
            disabled={guardando}
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="foto-badge"
      onClick={() => setEditando(true)}
      title="Club y nacionalidad"
    >
      🏳️
    </button>
  );
}