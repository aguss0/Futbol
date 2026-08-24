export function calcularStats(jugadorId, partidos) {
  const jugados = partidos.filter((p) =>
    p.participaciones.some((pp) => pp.jugadorId === jugadorId)
  );

  const detalle = jugados.map((p) => {
    const participacion = p.participaciones.find(
      (x) => x.jugadorId === jugadorId
    );
    const equipo = participacion.equipo;
    const golesPropios = equipo === 'A' ? p.golesEquipoA : p.golesEquipoB;
    const golesRival = equipo === 'A' ? p.golesEquipoB : p.golesEquipoA;
    const diferencia = golesPropios - golesRival;
    const resultado = diferencia > 0 ? 'G' : diferencia === 0 ? 'E' : 'P';
    return { id: p.id, fecha: p.fecha, resultado };
  });

  const pj = jugados.length;
  const pg = detalle.filter((d) => d.resultado === 'G').length;
  const pp = detalle.filter((d) => d.resultado === 'P').length;
  const goles = jugados.reduce((acc, p) => {
    const participacion = p.participaciones.find(
      (x) => x.jugadorId === jugadorId
    );
    return acc + (participacion.goles || 0);
  }, 0);

  const ultimos5 = detalle.slice(0, 5).reverse();

  return { pj, pg, pp, goles, ultimos5 };
}

export function calcularGoleadores(partidos, limite = 5) {
  const acumulado = new Map();

  partidos.forEach((p) => {
    p.participaciones.forEach((pp) => {
      if (!pp.goles) return;
      const actual = acumulado.get(pp.jugadorId) || {
        id: pp.jugadorId,
        nombre: pp.jugador.nombre,
        goles: 0,
      };
      actual.goles += pp.goles;
      acumulado.set(pp.jugadorId, actual);
    });
  });

  return Array.from(acumulado.values())
    .sort((a, b) => b.goles - a.goles)
    .slice(0, limite);
}
