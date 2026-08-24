import { calcularGoleadores } from '../lib/stats.js';

export default function TablaGoleadores({ partidos }) {
  const goleadores = calcularGoleadores(partidos, 5);

  if (goleadores.length === 0) return null;

  return (
    <div className="seccion">
      <h2>Tabla de goleadores</h2>
      <div className="tabla-goleadores">
        {goleadores.map((g, i) => (
          <div key={g.id} className="goleador-fila">
            <span className="goleador-puesto">{i + 1}</span>
            <span className="goleador-nombre">{g.nombre}</span>
            <span className="goleador-cantidad">{g.goles}⚽</span>
          </div>
        ))}
      </div>
    </div>
  );
}