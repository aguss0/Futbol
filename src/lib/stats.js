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

// Calcula las duplas de jugadores que más jugaron juntos en el mismo
// equipo, y su porcentaje de victorias jugando juntos. Requiere un mínimo
// de partidos en común para evitar que una dupla de 1 partido con 100% de
// victorias tape a duplas con más historial.
export function calcularQuimica(partidos, limite = 5, minPartidosJuntos = 3) {
  const duplas = new Map();

  function keyPara(idA, idB) {
    return idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`;
  }

  partidos.forEach((p) => {
    ['A', 'B'].forEach((equipo) => {
      const del = p.participaciones.filter((pp) => pp.equipo === equipo);
      const golesPropios = equipo === 'A' ? p.golesEquipoA : p.golesEquipoB;
      const golesRival = equipo === 'A' ? p.golesEquipoB : p.golesEquipoA;
      const gano = golesPropios > golesRival;

      for (let i = 0; i < del.length; i++) {
        for (let j = i + 1; j < del.length; j++) {
          const a = del[i];
          const b = del[j];
          const key = keyPara(a.jugadorId, b.jugadorId);

          const actual = duplas.get(key) || {
            key,
            jugadorAId: a.jugadorId,
            jugadorBId: b.jugadorId,
            nombreA: a.jugador.nombre,
            nombreB: b.jugador.nombre,
            pj: 0,
            victorias: 0,
          };
          actual.pj += 1;
          if (gano) actual.victorias += 1;
          duplas.set(key, actual);
        }
      }
    });
  });

  return Array.from(duplas.values())
    .filter((d) => d.pj >= minPartidosJuntos)
    .map((d) => ({ ...d, winrate: Math.round((d.victorias / d.pj) * 100) }))
    .sort((a, b) => b.winrate - a.winrate || b.pj - a.pj)
    .slice(0, limite);
}