import { useRef, useState } from 'react';
import { bandeUrl } from '../lib/paises.js';

function nivelDe(jugador) {
  if (jugador.activo === false) return 'inactivo';
  const media = jugador.media;
  if (media == null) return 'sin-media';
  if (media >= 95) return 'azul';
  if (media >= 85) return 'negro';
  if (media >= 75) return 'oro';
  if (media >= 65) return 'plata';
  return 'bronce';
}

function iniciales(nombre) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

// Forma de escudo en coordenadas absolutas (asume un contenedor de 220x310px,
// que es el tamaño fijo con el que siempre se muestra la carta).
const SHIELD_CLIP =
  'path("M10,0 H210 V250 C210,275 165,290 110,300 C55,290 10,275 10,250 Z")';

export default function CartaJugador({ jugador }) {
  const [errorFoto, setErrorFoto] = useState(false);
  const [errorBandera, setErrorBandera] = useState(false);
  const [errorEscudo, setErrorEscudo] = useState(false);
  const [girada, setGirada] = useState(false);
  const wrapRef = useRef(null);

  const nivel = nivelDe(jugador);

  const mostrarFoto = jugador.fotoUrl && !errorFoto;
  const urlBandera = bandeUrl(jugador.nacionalidad);
  const mostrarBandera = urlBandera && !errorBandera;
  const mostrarEscudo = jugador.escudoUrl && !errorEscudo;
  const stats = jugador.stats || { pj: 0, pg: 0, pp: 0, goles: 0 };
  const empates = Math.max(0, stats.pj - stats.pg - stats.pp);
  const winrate = stats.pj ? Math.round((stats.pg / stats.pj) * 100) : 0;

  function inclinar(e) {
    const elemento = wrapRef.current;
    if (!elemento || e.pointerType === 'touch') return;
    const rect = elemento.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    elemento.style.setProperty('--giro-x', `${(0.5 - y) * 14}deg`);
    elemento.style.setProperty('--giro-y', `${(x - 0.5) * 14}deg`);
    elemento.style.setProperty('--brillo-x', `${x * 100}%`);
    elemento.style.setProperty('--brillo-y', `${y * 100}%`);
  }

  function centrar() {
    const elemento = wrapRef.current;
    if (!elemento) return;
    elemento.style.setProperty('--giro-x', '0deg');
    elemento.style.setProperty('--giro-y', '0deg');
    elemento.style.setProperty('--brillo-x', '50%');
    elemento.style.setProperty('--brillo-y', '50%');
  }

  function alternarCarta() {
    setGirada((valor) => !valor);
  }

  return (
    <div
      ref={wrapRef}
      className="carta-html-wrap"
      role="button"
      tabIndex="0"
      aria-label={`${girada ? 'Ver frente' : 'Ver estadísticas'} de la carta de ${jugador.nombre}`}
      onClick={alternarCarta}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          alternarCarta();
        }
      }}
      onPointerMove={inclinar}
      onPointerLeave={centrar}
    >
      <div className="carta-html-tilt">
        <div className={`carta-html-flipper ${girada ? 'girada' : ''}`}>
          <div
            className={`carta-html carta-html-frente carta-html-${nivel}`}
            style={{ clipPath: SHIELD_CLIP }}
          >
            {mostrarFoto ? (
              <img
                src={jugador.fotoUrl}
                alt=""
                className="carta-html-foto"
                onError={() => setErrorFoto(true)}
              />
            ) : (
              <div className="carta-html-avatar">
                <span>{iniciales(jugador.nombre)}</span>
              </div>
            )}

            <div className="carta-html-datos">
              <span className="carta-html-media">{jugador.media ?? '—'}</span>
              <span className="carta-html-posicion">{jugador.posicion || '—'}</span>
              {mostrarBandera && (
                <img
                  src={urlBandera}
                  alt=""
                  className="carta-html-bandera"
                  onError={() => setErrorBandera(true)}
                />
              )}
              {mostrarEscudo && (
                <img
                  src={jugador.escudoUrl}
                  alt=""
                  className="carta-html-escudo"
                  onError={() => setErrorEscudo(true)}
                />
              )}
            </div>

            <div className="carta-html-nombre-franja">
              <span className="carta-html-nombre">{jugador.nombre}</span>
            </div>
            <span className="carta-giro-ayuda">Tocá para ver estadísticas ↻</span>
          </div>

          <div
            className={`carta-html carta-html-reverso carta-html-${nivel}`}
            style={{ clipPath: SHIELD_CLIP }}
          >
            <div className="carta-reverso-contenido">
              <span className="carta-reverso-kicker">ESTADÍSTICAS</span>
              <strong className="carta-reverso-nombre">{jugador.nombre}</strong>
              <span className="carta-reverso-media">MEDIA {jugador.media ?? '—'}</span>
              <div className="carta-reverso-grid">
                <div><strong>{stats.pj}</strong><span>PJ</span></div>
                <div><strong>{stats.pg}</strong><span>PG</span></div>
                <div><strong>{empates}</strong><span>PE</span></div>
                <div><strong>{stats.pp}</strong><span>PP</span></div>
                <div><strong>{stats.goles}</strong><span>GOL</span></div>
                <div><strong>{winrate}%</strong><span>WR</span></div>
              </div>
              <span className="carta-giro-ayuda">Tocá para volver ↻</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
