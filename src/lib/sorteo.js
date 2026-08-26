import { calcularMedia, calcularStats } from './stats.js';

const MEDIA_INICIAL_POR_DEFECTO = 70;

// Valor de un jugador según el criterio elegido: su media calculada, o su
// winrate histórico (% de partidos ganados). Si el jugador nunca jugó,
// se le asigna un winrate neutro (50%) para no perjudicarlo/beneficiarlo
// en el sorteo por falta de datos.
function valorJugador(jugador, partidos, criterio) {
  if (criterio === 'winrate') {
    const stats = calcularStats(jugador.id, partidos);
    if (stats.pj === 0) return 50;
    return (stats.pg / stats.pj) * 100;
  }

  const mediaInicial = jugador.media ?? MEDIA_INICIAL_POR_DEFECTO;
  return calcularMedia(
    jugador.id,
    partidos,
    mediaInicial,
    jugador.mediaReinicioFecha
  );
}

// Arma dos equipos balanceados: ordena a los jugadores de mayor a menor
// valor (con un empate al azar chico para variar entre sorteos) y los va
// repartiendo al equipo que en ese momento tenga la suma más baja — así
// los dos equipos terminan con un total lo más parecido posible.
export function balancearEquipos(jugadoresSeleccionados, partidos, criterio) {
  const conValor = jugadoresSeleccionados.map((j) => {
    const valor = valorJugador(j, partidos, criterio);
    return {
      jugador: j,
      valor,
      // Jitter chico y fijo por jugador (calculado una sola vez, no en
      // cada comparación) para que el orden entre valores empatados
      // varíe de sorteo en sorteo sin romper el balance general.
      claveOrden: valor + (Math.random() - 0.5) * 0.6,
    };
  });

  const ordenados = [...conValor].sort((a, b) => b.claveOrden - a.claveOrden);

  const equipoA = [];
  const equipoB = [];
  let sumaA = 0;
  let sumaB = 0;

  ordenados.forEach(({ jugador, valor }) => {
    if (sumaA <= sumaB) {
      equipoA.push(jugador);
      sumaA += valor;
    } else {
      equipoB.push(jugador);
      sumaB += valor;
    }
  });

  const promedioA = equipoA.length ? sumaA / equipoA.length : 0;
  const promedioB = equipoB.length ? sumaB / equipoB.length : 0;

  return { equipoA, equipoB, promedioA, promedioB };
}