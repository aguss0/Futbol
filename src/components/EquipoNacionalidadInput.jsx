import { useRef, useState } from 'react';
import { PAISES } from '../lib/paises.js';
import { POSICIONES_JUGADOR } from '../lib/posiciones.js';
import { subirFoto } from '../lib/api.js';

export default function EquipoNacionalidadInput({
  equipo,
  escudoUrl,
  posicion,
  nacionalidad,
  onGuardar,
}) {
  const [editando, setEditando] = useState(false);
  const [valorEquipo, setValorEquipo] = useState(equipo || '');
  const [valorEscudoUrl, setValorEscudoUrl] = useState(escudoUrl || '');
  const [valorPosicion, setValorPosicion] = useState(posicion || '');
  const [valorNacionalidad, setValorNacionalidad] = useState(nacionalidad || '');
  const [guardando, setGuardando] = useState(false);
  const [subiendoEscudo, setSubiendoEscudo] = useState(false);
  const [error, setError] = useState('');
  const inputEscudoRef = useRef(null);

  async function handleEscudo(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Elegí un archivo de imagen para el escudo.');
      return;
    }
    setError('');
    setSubiendoEscudo(true);
    try {
      const url = await subirFoto(file);
      setValorEscudoUrl(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubiendoEscudo(false);
    }
  }

  async function confirmar() {
    setGuardando(true);
    try {
      await onGuardar({
        equipo: valorEquipo.trim() || null,
        escudoUrl: valorEscudoUrl || null,
        posicion: valorPosicion || null,
        nacionalidad: valorNacionalidad || null,
      });
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

          <label>Escudo del club</label>
          <div className="escudo-fila">
            {valorEscudoUrl && (
              <img src={valorEscudoUrl} alt="" className="escudo-preview" />
            )}
            <button
              type="button"
              className="btn btn-secundario btn-chico"
              onClick={() => inputEscudoRef.current?.click()}
              disabled={guardando || subiendoEscudo}
            >
              {subiendoEscudo
                ? 'Subiendo…'
                : valorEscudoUrl
                  ? 'Cambiar'
                  : 'Subir escudo'}
            </button>
            <input
              ref={inputEscudoRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleEscudo}
            />
          </div>

          <label>Posición</label>
          <select
            value={valorPosicion}
            disabled={guardando}
            onChange={(e) => setValorPosicion(e.target.value)}
          >
            <option value="">Sin definir</option>
            {POSICIONES_JUGADOR.map((p) => (
              <option key={p.code} value={p.code}>
                {p.label}
              </option>
            ))}
          </select>

          <label>Nacionalidad</label>
          <select
            value={valorNacionalidad}
            disabled={guardando}
            onChange={(e) => setValorNacionalidad(e.target.value)}
          >
            <option value="">Sin definir</option>
            {PAISES.map((p) => (
              <option key={p.code} value={p.code}>
                {p.nombre}
              </option>
            ))}
          </select>

          {error && <p className="mensaje-error">{error}</p>}

          <button
            type="button"
            className="btn btn-chico"
            onClick={confirmar}
            disabled={guardando || subiendoEscudo}
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
      title="Club, posición y nacionalidad"
    >
      🏳️
    </button>
  );
}