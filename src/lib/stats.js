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

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

const CAPITAN_MULTIPLICADOR = 1.5;

// Calcula la media "en vivo" de un jugador recorriendo su historial de
// partidos en orden cronológico, arrancando desde mediaInicial (el valor
// que se carga a mano como excepción, ej. para un jugador nuevo).
//
// Por cada partido se suma/resta un ajuste según:
// - si ganó, empató o perdió
// - la diferencia de gol (con tope, para que una goleada no dispare todo)
// - los goles que hizo ese jugador (con tope)
//
// El ajuste se atenúa según la media que ya tiene el jugador en ese
// momento: cuanto más alta, más cuesta subir y más pesa una caída; cuanto
// más baja, más fácil sube y menos pesa una caída.
export function calcularMedia(
  jugadorId,
  partidos,
  mediaInicial = 70,
  fechaReinicio = null
) {
  let jugados = partidos.filter((p) =>
    p.participaciones.some((pp) => pp.jugadorId === jugadorId)
  );

  // Si hubo un ajuste manual (excepción), solo cuentan los partidos
  // cargados DESPUÉS de ese ajuste — los anteriores quedan "borrados" del
  // cálculo, como si se reiniciara el conteo desde ese número.
  if (fechaReinicio) {
    const limite = new Date(fechaReinicio).getTime();
    jugados = jugados.filter((p) => new Date(p.createdAt).getTime() > limite);
  }

  // Se procesan del partido más viejo al más nuevo (la API los trae al
  // revés, del más nuevo al más viejo).
  const enOrden = [...jugados].sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha) || a.id - b.id
  );

  let media = mediaInicial;

  enOrden.forEach((p) => {
    const participacion = p.participaciones.find(
      (pp) => pp.jugadorId === jugadorId
    );
    const equipo = participacion.equipo;
    const golesPropios = equipo === 'A' ? p.golesEquipoA : p.golesEquipoB;
    const golesRival = equipo === 'A' ? p.golesEquipoB : p.golesEquipoA;
    const diferencia = golesPropios - golesRival;

    const deltaResultado = diferencia > 0 ? 1 : diferencia === 0 ? 0 : -1;
    const deltaDiferencia = clamp(diferencia, -3, 3) * 0.5;
    const deltaGoles = Math.min(participacion.goles || 0, 3);

    let ajusteCrudo = deltaResultado + deltaDiferencia + deltaGoles;

    // El capitán tiene más responsabilidad: si el ajuste ya iba a ser
    // positivo (ganó, hizo goles) se amplifica más todavía; si iba a ser
    // negativo (perdió), también le pega más fuerte.
    if (participacion.capitan) {
      ajusteCrudo *= CAPITAN_MULTIPLICADOR;
    }

    let factor = 1;
    if (ajusteCrudo > 0) {
      // Cuanto más alta la media, más cuesta subir (factor baja de 1.6 a 0.3)
      factor = clamp(1.6 - (media / 100) * 1.2, 0.3, 1.6);

      // En los extremos se acentúa la progresión: desde 90 cuesta
      // considerablemente más subir, mientras que desde 64 hacia abajo
      // la recuperación es más rápida.
      if (media >= 90) factor *= 0.65;
      else if (media <= 64) factor *= 1.35;
    } else if (ajusteCrudo < 0) {
      // Cuanto más alta la media, más pesa una caída (factor sube de 0.4 a 1.6)
      factor = clamp(0.4 + (media / 100) * 1.2, 0.4, 1.6);
    }

    media = clamp(media + ajusteCrudo * factor, 60, 99);
  });

  return Math.round(media);
}
