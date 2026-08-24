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

export default function CartaJugador({ jugador, stats }) {
  const nivel = nivelDe(jugador.media);
  const [colorA, colorB] = GRADIENTES[nivel];
  const gradId = `carta-grad-${jugador.id}`;

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
      </defs>

      {/* Forma escudo */}
      <path
        d="M10,0 H210 V190 C210,240 165,260 110,300 C55,260 10,240 10,190 Z"
        fill={`url(#${gradId})`}
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2"
      />

      {/* Media */}
      <text x="26" y="70" className="carta-media">
        {jugador.media ?? '—'}
      </text>
      <text x="26" y="92" className="carta-posicion">
        JUG
      </text>

      {/* Avatar con iniciales */}
      <circle cx="110" cy="150" r="58" className="carta-avatar-fondo" />
      <text x="110" y="168" textAnchor="middle" className="carta-avatar-texto">
        {iniciales(jugador.nombre)}
      </text>

      {/* Nombre */}
      <text x="110" y="245" textAnchor="middle" className="carta-nombre">
        {jugador.nombre}
      </text>

      {/* Stats mini, si vienen */}
      {stats && (
        <g>
          <line x1="35" y1="262" x2="185" y2="262" className="carta-linea" />
          <text x="55" y="284" textAnchor="middle" className="carta-stat-valor">
            {stats.pj}
          </text>
          <text x="55" y="298" textAnchor="middle" className="carta-stat-label">
            PJ
          </text>

          <text x="110" y="284" textAnchor="middle" className="carta-stat-valor">
            {stats.pg}
          </text>
          <text x="110" y="298" textAnchor="middle" className="carta-stat-label">
            G
          </text>

          <text x="165" y="284" textAnchor="middle" className="carta-stat-valor">
            {stats.goles}
          </text>
          <text x="165" y="298" textAnchor="middle" className="carta-stat-label">
            GOL
          </text>
        </g>
      )}
    </svg>
  );
}