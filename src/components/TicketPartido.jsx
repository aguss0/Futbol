function nombresDe(partido, equipo) {
  return partido.participaciones
    .filter((p) => p.equipo === equipo)
    .map((p) => p.jugador.nombre)
    .join(', ');
}

function formatearFecha(fechaIso) {
  const f = new Date(fechaIso);
  return f.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function TicketPartido({ partido }) {
  const ganoA = partido.golesEquipoA > partido.golesEquipoB;
  const ganoB = partido.golesEquipoB > partido.golesEquipoA;

  return (
    <div className="ticket">
      <div className="ticket-info">
        <span className="fecha">{formatearFecha(partido.fecha)}</span>
        {partido.cancha && <span className="cancha">{partido.cancha}</span>}
      </div>
      <div className="ticket-marcador">
        <div className={`equipo ${ganoA ? 'gano' : ''}`}>
          <div className="etiqueta">Equipo A</div>
          <div className="nombres">{nombresDe(partido, 'A')}</div>
        </div>
        <div className="resultado">
          {partido.golesEquipoA}
          <span className="sep">–</span>
          {partido.golesEquipoB}
        </div>
        <div className={`equipo ${ganoB ? 'gano' : ''}`} style={{ textAlign: 'right' }}>
          <div className="etiqueta">Equipo B</div>
          <div className="nombres">{nombresDe(partido, 'B')}</div>
        </div>
      </div>
    </div>
  );
}
