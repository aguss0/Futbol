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

// Forma de escudo en coordenadas absolutas (asume un contenedor de 220x310px,
// que es el tamaño fijo con el que siempre se muestra la carta).
const SHIELD_CLIP =
  'path("M10,0 H210 V250 C210,275 165,290 110,300 C55,290 10,275 10,250 Z")';

export default function CartaJugador({ jugador }) {
  const [errorFoto, setErrorFoto] = useState(false);
  const [errorBandera, setErrorBandera] = useState(false);
  const [errorEscudo, setErrorEscudo] = useState(false);

  const nivel = nivelDe(jugador.media);

  const mostrarFoto = jugador.fotoUrl && !errorFoto;
  const urlBandera = bandeUrl(jugador.nacionalidad);
  const mostrarBandera = urlBandera && !errorBandera;
  const mostrarEscudo = jugador.escudoUrl && !errorEscudo;

  return (
    <div className="carta-html-wrap">
      <div
        className={`carta-html carta-html-${nivel}`}
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

        <div className={`carta-html-nombre-franja carta-html-${nivel}`}>
          <span className="carta-html-nombre">{jugador.nombre}</span>
        </div>
      </div>
    </div>
  );
}