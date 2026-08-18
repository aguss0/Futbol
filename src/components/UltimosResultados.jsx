const ICONO = { G: '✓', E: '–', P: '✕' };
const CLASE = { G: 'resultado-g', E: 'resultado-e', P: 'resultado-p' };

export default function UltimosResultados({ detalle }) {
  if (detalle.length === 0) {
    return <span className="resultado-vacio">—</span>;
  }

  return (
    <div className="resultado-fila">
      {detalle.map((d) => (
        <span key={d.id} className={`resultado-circulo ${CLASE[d.resultado]}`}>
          {ICONO[d.resultado]}
        </span>
      ))}
    </div>
  );
}
