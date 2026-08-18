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
    return { id: p.id, fecha: p.fecha, resultado, diferencia };
  });

  const pg = detalle.filter((d) => d.resultado === 'G').length;
  const pe = detalle.filter((d) => d.resultado === 'E').length;
  const pp = detalle.filter((d) => d.resultado === 'P').length;
  const pj = jugados.length;

  const winrate = pj ? Math.round((pg / pj) * 100) : 0;

  // detalle está en orden desc (más reciente primero); para el gráfico
  // queremos orden cronológico (más viejo a la izquierda).
  const ultimos5 = detalle.slice(0, 5).reverse();

  return { pj, pg, pe, pp, winrate, ultimos5 };
}
