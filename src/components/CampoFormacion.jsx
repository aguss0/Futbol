function iniciales(nombre) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

function Marcador({ x, y, jugador, colorClass, corta, onClick }) {
  return (
    <g
      transform={`translate(${x}, ${y})`}
      className="marcador-click"
      onClick={onClick}
    >
      <circle r="34" fill="transparent" style={{ pointerEvents: 'all' }} />
      <circle
        r="23"
        className={jugador ? `marcador-lleno ${colorClass}` : 'marcador-vacio'}
      />
      {jugador ? (
        <text textAnchor="middle" dy="5" className="marcador-texto">
          {iniciales(jugador.nombre)}
        </text>
      ) : (
        <text textAnchor="middle" dy="6" className="marcador-mas">
          +
        </text>
      )}
      <text textAnchor="middle" y="40" className="marcador-nombre">
        {jugador ? jugador.nombre.split(' ')[0] : corta}
      </text>
    </g>
  );
}

const ANCHO_CANCHA = 640;

export default function CampoFormacion({
  posiciones,
  seleccionA,
  seleccionB,
  onSlotClick,
}) {
  return (
    <svg
      className="campo-svg"
      viewBox="0 0 640 400"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="640" height="400" className="campo-pasto" />
      <rect x="8" y="8" width="624" height="384" className="campo-borde" />
      <line x1="320" y1="8" x2="320" y2="392" className="campo-linea" />
      <circle cx="320" cy="200" r="48" className="campo-linea-fill" />
      <rect x="8" y="130" width="70" height="140" className="campo-linea-fill" />
      <rect x="562" y="130" width="70" height="140" className="campo-linea-fill" />

      {posiciones.map(({ key, corta, x, y }) => (
        <Marcador
          key={`a-${key}`}
          x={x}
          y={y}
          jugador={seleccionA[key]}
          colorClass="pechera-a"
          corta={corta}
          onClick={() => onSlotClick?.('A', key)}
        />
      ))}
      {posiciones.map(({ key, corta, x, y }) => (
        <Marcador
          key={`b-${key}`}
          x={ANCHO_CANCHA - x}
          y={y}
          jugador={seleccionB[key]}
          colorClass="pechera-b"
          corta={corta}
          onClick={() => onSlotClick?.('B', key)}
        />
      ))}
    </svg>
  );
}
