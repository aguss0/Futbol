const SEGMENTO = 56;
const ALTO = 92;
const ZERO_Y = 46;
const ESCALA = 6; // px por gol de diferencia
const MAX_DIF = 5;

const COLOR = { G: 'barra-g', E: 'barra-e', P: 'barra-p' };
const ETIQUETA = { G: 'V', E: 'E', P: 'D' };

export default function GraficoForma({ detalle }) {
  if (detalle.length === 0) return null;

  const ancho = SEGMENTO * detalle.length;

  return (
    <svg
      className="forma-svg"
      viewBox={`0 0 ${ancho} ${ALTO}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="0" y1={ZERO_Y} x2={ancho} y2={ZERO_Y} className="forma-cero" />
      {detalle.map((d, i) => {
        const cx = i * SEGMENTO + SEGMENTO / 2;
        const dif = Math.max(-MAX_DIF, Math.min(MAX_DIF, d.diferencia));
        const h = Math.max(Math.abs(dif) * ESCALA, 4);
        const y = dif >= 0 ? ZERO_Y - h : ZERO_Y;
        const textoY = dif >= 0 ? ZERO_Y - h - 6 : ZERO_Y + h + 14;

        return (
          <g key={d.id}>
            <rect
              x={cx - 12}
              y={y}
              width="24"
              height={h}
              rx="3"
              className={COLOR[d.resultado]}
            />
            <text x={cx} y={textoY} textAnchor="middle" className="forma-texto">
              {ETIQUETA[d.resultado]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
