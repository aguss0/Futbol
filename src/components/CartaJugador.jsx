import { useState } from 'react';
import { bandeUrl } from '../lib/paises.js';

function nivelDe(media) {
  if (media == null) return 'sin-media';
  if (media >= 85) return 'especial';
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

// Misma curva que usábamos en SVG (escudo ancho hasta el 80% de la altura,
// angostándose recién al final), pero en fracciones 0–1 para que funcione
// con clip-path en cualquier tamaño de contenedor.
const CLIP_ID_BASE = 'carta-clip';
const SHIELD_PATH_FRACCION =
  'M0.045,0 H0.955 V0.806 C0.955,0.887 0.75,0.935 0.5,0.968 C0.25,0.935 0.045,0.887 0.045,0.806 Z';

export default function CartaJugador({ jugador }) {
  const [errorFoto, setErrorFoto] = useState(false);
  const [errorBandera, setErrorBandera] = useState(false);
  const [errorEscudo, setErrorEscudo] = useState(false);

  const nivel = nivelDe(jugador.media);
  const clipId = `${CLIP_ID_BASE}-${jugador.id}`;

  const mostrarFoto = jugador.fotoUrl && !errorFoto;
  const urlBandera = bandeUrl(jugador.nacionalidad);
  const mostrarBandera = urlBandera && !errorBandera;
  const mostrarEscudo = jugador.escudoUrl && !errorEscudo;

  return (
    <div className="carta-html-wrap">
      {/* SVG invisible, solo para definir la forma de escudo que se usa
          como clip-path sobre el div de abajo. No dibuja nada visible. */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={SHIELD_PATH_FRACCION} />
          </clipPath>
        </defs>
      </svg>

      <div
        className={`carta-html carta-html-${nivel}`}
        style={{ clipPath: `url(#${clipId})` }}
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
      </div>
    </div>
  );
}