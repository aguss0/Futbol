// Define, por formato, las "líneas" del equipo (arquero, defensa,
// mediocampo, delantera) y cuántos jugadores va en cada una. Las
// coordenadas Y de cada jugador dentro de su línea se calculan solas,
// repartidas parejo en la altura de la cancha.
const LINEAS_POR_FORMATO = {
  5: [
    { rol: 'arquero', corta: 'ARQ', cantidad: 1, x: 40 },
    { rol: 'defensor', corta: 'DEF', cantidad: 2, x: 130 },
    { rol: 'delantero', corta: 'DEL', cantidad: 2, x: 250 },
  ],
  6: [
    { rol: 'arquero', corta: 'ARQ', cantidad: 1, x: 40 },
    { rol: 'defensor', corta: 'DEF', cantidad: 2, x: 115 },
    { rol: 'mediocampista', corta: 'MED', cantidad: 2, x: 195 },
    { rol: 'delantero', corta: 'DEL', cantidad: 1, x: 270 },
  ],
  7: [
    { rol: 'arquero', corta: 'ARQ', cantidad: 1, x: 35 },
    { rol: 'defensor', corta: 'DEF', cantidad: 3, x: 105 },
    { rol: 'mediocampista', corta: 'MED', cantidad: 2, x: 190 },
    { rol: 'delantero', corta: 'DEL', cantidad: 1, x: 270 },
  ],
};

const MARGEN_Y = 60;
const ALTO_CANCHA = 400;

function coordenadasY(cantidad) {
  if (cantidad === 1) return [ALTO_CANCHA / 2];
  const paso = (ALTO_CANCHA - MARGEN_Y * 2) / (cantidad - 1);
  return Array.from({ length: cantidad }, (_, i) => MARGEN_Y + i * paso);
}

function capitalizar(palabra) {
  return palabra.charAt(0).toUpperCase() + palabra.slice(1);
}

// Devuelve la lista de posiciones (key, label, corta, x, y) para el
// formato pedido. Si no reconoce el formato, cae en fútbol 5 por defecto.
export function obtenerPosiciones(formato) {
  const lineas = LINEAS_POR_FORMATO[formato] || LINEAS_POR_FORMATO[5];
  const posiciones = [];

  lineas.forEach(({ rol, corta, cantidad, x }) => {
    coordenadasY(cantidad).forEach((y, i) => {
      const key = cantidad === 1 ? rol : `${rol}${i + 1}`;
      const label =
        cantidad === 1 ? capitalizar(rol) : `${capitalizar(rol)} ${i + 1}`;
      posiciones.push({ key, label, corta, x, y });
    });
  });

  return posiciones;
}

export const FORMATOS_DISPONIBLES = [
  { valor: 5, label: 'Fútbol 5' },
  { valor: 6, label: 'Fútbol 6' },
  { valor: 7, label: 'Fútbol 7' },
];

export function inferirFormato(participaciones = []) {
  const n = Math.max(
    participaciones.filter((p) => p.equipo === 'A').length,
    participaciones.filter((p) => p.equipo === 'B').length,
    5
  );
  if (n >= 7) return 7;
  if (n >= 6) return 6;
  return 5;
}

export function equipoVacio(formato) {
  return Object.fromEntries(
    obtenerPosiciones(formato).map((p) => [p.key, null])
  );
}

// Pasa los jugadores de una formación a otra: primero copia los que
// coinciden de posición, y el resto los acomoda en los huecos libres.
export function traspasarSeleccion(prev, formato) {
  const posiciones = obtenerPosiciones(formato);
  const next = equipoVacio(formato);
  const usados = new Set();

  posiciones.forEach(({ key }) => {
    const jugador = prev[key];
    if (jugador && !usados.has(jugador.id)) {
      next[key] = jugador;
      usados.add(jugador.id);
    }
  });

  const sobrantes = Object.values(prev).filter(
    (j) => j && !usados.has(j.id)
  );
  posiciones.forEach(({ key }) => {
    if (!next[key] && sobrantes.length) {
      next[key] = sobrantes.shift();
    }
  });

  return next;
}
