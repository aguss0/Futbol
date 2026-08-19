export const POSICIONES = [
  { key: 'arquero', label: 'Arquero', corta: 'ARQ' },
  { key: 'defensor1', label: 'Defensor 1', corta: 'DEF' },
  { key: 'defensor2', label: 'Defensor 2', corta: 'DEF' },
  { key: 'delantero1', label: 'Delantero 1', corta: 'DEL' },
  { key: 'delantero2', label: 'Delantero 2', corta: 'DEL' },
];

// Coordenadas en un viewBox de 640x400, equipo A a la izquierda.
const COORDS_A = {
  arquero: { x: 40, y: 200 },
  defensor1: { x: 130, y: 110 },
  defensor2: { x: 130, y: 290 },
  delantero1: { x: 250, y: 150 },
  delantero2: { x: 250, y: 250 },
};

// Espejado para el equipo B (derecha).
const COORDS_B = Object.fromEntries(
  Object.entries(COORDS_A).map(([key, { x, y }]) => [
    key,
    { x: 640 - x, y },
  ])
);

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
      <circle
        r="22"
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
      <text textAnchor="middle" y="38" className="marcador-nombre">
        {jugador ? jugador.nombre.split(' ')[0] : corta}
      </text>
    </g>
  );
}

export default function CampoFormacion({ seleccionA, seleccionB, onSlotClick }) {
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

      {POSICIONES.map(({ key, corta }) => (
        <Marcador
          key={`a-${key}`}
          x={COORDS_A[key].x}
          y={COORDS_A[key].y}
          jugador={seleccionA[key]}
          colorClass="pechera-a"
          corta={corta}
          onClick={() => onSlotClick?.('A', key)}
        />
      ))}
      {POSICIONES.map(({ key, corta }) => (
        <Marcador
          key={`b-${key}`}
          x={COORDS_B[key].x}
          y={COORDS_B[key].y}
          jugador={seleccionB[key]}
          colorClass="pechera-b"
          corta={corta}
          onClick={() => onSlotClick?.('B', key)}
        />
      ))}
    </svg>
  );
}
