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

export default function TicketPartido({ partido, onEditar, onEliminar }) {
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
      {(onEditar || onEliminar) && (
        <div className="ticket-acciones">
          {onEditar && (
            <button
              type="button"
              className="ticket-accion"
              onClick={() => onEditar(partido.id)}
              aria-label="Editar partido"
              title="Editar"
            >
              ✎
            </button>
          )}
          {onEliminar && (
            <button
              type="button"
              className="ticket-accion ticket-accion-borrar"
              onClick={() => onEliminar(partido.id)}
              aria-label="Eliminar partido"
              title="Eliminar"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}
