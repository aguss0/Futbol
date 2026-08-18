export function calcularStats(jugadorId, partidos) {
  // partidos viene ordenado desc por fecha (como lo devuelve la API)
  const jugados = partidos.filter((p) =>
    p.participaciones.some((pp) => pp.jugadorId === jugadorId)
  );

  const detalle = jugados.map((p) => {
    const equipo = p.participaciones.find(
      (x) => x.jugadorId === jugadorId
    ).equipo;
    const golesPropios = equipo === 'A' ? p.golesEquipoA : p.golesEquipoB;
    const golesRival = equipo === 'A' ? p.golesEquipoB : p.golesEquipoA;
    const diferencia = golesPropios - golesRival;
    const resultado = diferencia > 0 ? 'G' : diferencia === 0 ? 'E' : 'P';
    return { id: p.id, fecha: p.fecha, resultado };
  });

  const pj = jugados.length;
  const pg = detalle.filter((d) => d.resultado === 'G').length;
  const pp = detalle.filter((d) => d.resultado === 'P').length;

  // detalle está en orden desc (más reciente primero); para mostrar los
  // últimos 5 en orden cronológico (más viejo a la izquierda), invertimos.
  const ultimos5 = detalle.slice(0, 5).reverse();

  return { pj, pg, pp, ultimos5 };
}
