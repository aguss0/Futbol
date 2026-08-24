import { calcularQuimica } from '../lib/stats.js';

export default function TablaQuimica({ partidos }) {
  const duplas = calcularQuimica(partidos, 5, 3);

  if (duplas.length === 0) {
    return (
      <div className="tabla-secundaria">
        <h2>Mejor química</h2>
        <div className="vacio vacio-chico">
          Todavía no hay suficientes partidos en común entre jugadores
          (mínimo 3 juntos) para mostrar duplas.
        </div>
      </div>
    );
  }

  return (
    <div className="tabla-secundaria">
      <h2>Mejor química</h2>
      <div className="tabla-goleadores">
        {duplas.map((d, i) => (
          <div key={d.key} className="quimica-fila">
            <span className="goleador-puesto">{i + 1}</span>
            <span className="quimica-nombres">
              {d.nombreA} <span className="quimica-y">+</span> {d.nombreB}
            </span>
            <span className="quimica-winrate">{d.winrate}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}