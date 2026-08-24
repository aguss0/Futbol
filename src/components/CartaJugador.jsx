import { useState } from 'react';
import { bandeUrl } from '../lib/paises.js';

function nivelDe(media) {
  if (media == null) return 'sin-media';
  if (media >= 85) return 'especial';
  if (media >= 75) return 'oro';
  if (media >= 65) return 'plata';
  return 'bronce';
}

const GRADIENTES = {
  'sin-media': ['#cfd8d3', '#a7b3ac'],
  bronce: ['#b08d57', '#8a6a3d'],
  plata: ['#b8c2c9', '#8a97a1'],
  oro: ['#f0c766', '#e8a63d'],
  especial: ['#a97fd1', '#6f43a0'],
};

function iniciales(nombre) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

const SHIELD_PATH =
  'M10,0 H210 V190 C210,240 165,260 110,300 C55,260 10,240 10,190 Z';

export default function CartaJugador({ jugador }) {
  const [errorFoto, setErrorFoto] = useState(false);
  const [errorBandera, setErrorBandera] = useState(false);
  const [errorEscudo, setErrorEscudo] = useState(false);

  const nivel = nivelDe(jugador.media);
  const [colorA, colorB] = GRADIENTES[nivel];
  const gradId = `carta-grad-${jugador.id}`;
  const clipId = `carta-clip-${jugador.id}`;

  const mostrarFoto = jugador.fotoUrl && !errorFoto;
  const urlBandera = bandeUrl(jugador.nacionalidad);
  const mostrarBandera = urlBandera && !errorBandera;
  const mostrarEscudo = jugador.escudoUrl && !errorEscudo;

  return (
    <svg
      className="carta-svg"
      viewBox="0 0 220 310"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colorA} />
          <stop offset="100%" stopColor={colorB} />
        </linearGradient>
        <clipPath id={clipId}>
          <path d={SHIELD_PATH} />
        </clipPath>
      </defs>

      {/* Fondo dorado (queda visible arriba, donde va la columna de datos) */}
      <path d={SHIELD_PATH} fill={`url(#${gradId})`} />

      {/* Foto del jugador: arranca más abajo, para no pisar la columna de
          datos (media/posición/bandera/escudo), y una franja translúcida
          al pie para que el nombre se lea bien encima. */}
      {jugador.fotoUrl && (
        <g clipPath={`url(#${clipId})`} style={{ display: mostrarFoto ? 'block' : 'none' }}>
          <image
            href={jugador.fotoUrl}
            x="10"
            y="165"
            width="200"
            height="135"
            preserveAspectRatio="xMidYMin slice"
            onError={() => setErrorFoto(true)}
          />
          <rect x="0" y="256" width="220" height="54" fill={`url(#${gradId})`} opacity="0.93" />
        </g>
      )}

      {/* Borde del escudo, arriba de la foto */}
      <path
        d={SHIELD_PATH}
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2"
      />

      {/* Avatar con iniciales: fallback si no hay foto, o si la foto rompió */}
      {!mostrarFoto && (
        <>
          <circle cx="110" cy="190" r="58" className="carta-avatar-fondo" />
          <text x="110" y="208" textAnchor="middle" className="carta-avatar-texto">
            {iniciales(jugador.nombre)}
          </text>
        </>
      )}

      {/* Columna de datos: media, posición, bandera y escudo, con
          espaciado parejo, siempre alineados a la izquierda. */}
      <text x="26" y="62" className="carta-media">
        {jugador.media ?? '—'}
      </text>
      <text x="26" y="85" className="carta-posicion">
        {jugador.posicion || '—'}
      </text>

      {mostrarBandera && (
        <image
          href={urlBandera}
          x="24"
          y="95"
          width="34"
          height="24"
          onError={() => setErrorBandera(true)}
        />
      )}

      {mostrarEscudo && (
        <image
          href={jugador.escudoUrl}
          x="25"
          y="127"
          width="32"
          height="32"
          preserveAspectRatio="xMidYMid meet"
          onError={() => setErrorEscudo(true)}
        />
      )}

      {/* Nombre, siempre abajo, centrado */}
      <text x="110" y="286" textAnchor="middle" className="carta-nombre">
        {jugador.nombre}
      </text>
    </svg>
  );
}