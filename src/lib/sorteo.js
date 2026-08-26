import { calcularMedia, calcularStats } from './stats.js';

const MEDIA_INICIAL_POR_DEFECTO = 70;

// Cantidades de jugadores permitidas para el sorteo (5 vs 5, 6 vs 6, 7 vs 7)
export const CANTIDADES_VALIDAS = [10, 12, 14];

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

// Arma dos equipos con EXACTAMENTE la misma cantidad de jugadores (mitad y
// mitad), balanceando el total del criterio elegido lo mejor posible.
//
// Cómo lo hace: ordena a todos de mayor a menor valor (con un empate al
// azar chico para variar entre sorteos) y los va tomando de a pares. En
// cada par, el jugador con más valor va al equipo que en ese momento tiene
// la suma más baja, y el otro del par va al equipo contrario — así cada
// par siempre reparte uno para cada lado (garantiza cantidades iguales) y
// además el equipo que venía más flojo recibe el mejor del par siguiente.
export function balancearEquipos(jugadoresSeleccionados, partidos, criterio) {
  const conValor = jugadoresSeleccionados.map((j) => {
    const valor = valorJugador(j, partidos, criterio);
    return {
      jugador: j,
      valor,
      claveOrden: valor + (Math.random() - 0.5) * 0.6,
    };
  });

  const ordenados = [...conValor].sort((a, b) => b.claveOrden - a.claveOrden);

  const equipoA = [];
  const equipoB = [];
  let sumaA = 0;
  let sumaB = 0;

  for (let i = 0; i < ordenados.length; i += 2) {
    const primero = ordenados[i];
    const segundo = ordenados[i + 1];

    if (sumaA <= sumaB) {
      equipoA.push(primero.jugador);
      sumaA += primero.valor;
      if (segundo) {
        equipoB.push(segundo.jugador);
        sumaB += segundo.valor;
      }
    } else {
      equipoB.push(primero.jugador);
      sumaB += primero.valor;
      if (segundo) {
        equipoA.push(segundo.jugador);
        sumaA += segundo.valor;
      }
    }
  }

  const promedioA = equipoA.length ? sumaA / equipoA.length : 0;
  const promedioB = equipoB.length ? sumaB / equipoB.length : 0;

  return { equipoA, equipoB, promedioA, promedioB };
}

// Genera el sorteo con los dos criterios a la vez, para poder comparar y
// quedarse con el que más convenza.
export function sortearAmbosCriterios(jugadoresSeleccionados, partidos) {
  return {
    porMedia: balancearEquipos(jugadoresSeleccionados, partidos, 'media'),
    porWinrate: balancearEquipos(jugadoresSeleccionados, partidos, 'winrate'),
  };
}