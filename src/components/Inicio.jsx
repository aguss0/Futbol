import { useEffect, useState } from 'react';
import { getPartidos } from '../lib/api.js';
import TicketPartido from './TicketPartido.jsx';

export default function Inicio() {
  const [partidos, setPartidos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getPartidos()
      .then(setPartidos)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="mensaje-error">{error}</p>;
  if (!partidos) return <p>Cargando partidos…</p>;

  const ultimos5 = partidos.slice(0, 5);
  const resto = partidos.slice(5);

  return (
    <>
      <div className="seccion" style={{ marginTop: 0 }}>
        <h2>Últimos 5 partidos</h2>
        {ultimos5.length === 0 ? (
          <div className="vacio">
            Todavía no hay partidos cargados. Andá a "Nuevo partido" y
            arrancá el histórico.
          </div>
        ) : (
          ultimos5.map((p) => <TicketPartido key={p.id} partido={p} />)
        )}
      </div>

      {resto.length > 0 && (
        <div className="seccion">
          <h2>Histórico completo</h2>
          {resto.map((p) => (
            <TicketPartido key={p.id} partido={p} />
          ))}
        </div>
      )}
    </>
  );
}
