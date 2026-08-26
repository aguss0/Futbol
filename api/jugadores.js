import { prisma } from './_db.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const jugadores = await prisma.jugador.findMany({
        orderBy: { nombre: 'asc' },
      });
      return res.status(200).json(jugadores);
    }

    if (req.method === 'POST') {
      const { nombre } = req.body || {};
      if (!nombre || !nombre.trim()) {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
      }
      const jugador = await prisma.jugador.create({
        data: { nombre: nombre.trim() },
      });
      return res.status(201).json(jugador);
    }

    if (req.method === 'PATCH') {
      const { id, activo, media, fotoUrl, equipo, escudoUrl, posicion, nacionalidad } =
        req.body || {};
      if (typeof id !== 'number') {
        return res.status(400).json({ error: 'Falta id de jugador' });
      }

      const data = {};
      if (typeof activo === 'boolean') data.activo = activo;
      if (media !== undefined) {
        if (media === null) {
          data.media = null;
        } else {
          const n = Number(media);
          if (!Number.isInteger(n) || n < 1 || n > 99) {
            return res
              .status(400)
              .json({ error: 'La media debe ser un número entre 1 y 99' });
          }
          data.media = n;
        }
      }
      if (fotoUrl !== undefined) data.fotoUrl = fotoUrl ? fotoUrl.trim() : null;
      if (equipo !== undefined) data.equipo = equipo ? equipo.trim() : null;
      if (escudoUrl !== undefined) data.escudoUrl = escudoUrl ? escudoUrl.trim() : null;
      if (nacionalidad !== undefined) {
        data.nacionalidad = nacionalidad ? nacionalidad.trim().toUpperCase() : null;
      }
      if (posicion !== undefined) {
        const validas = [
          'POR', 'LI', 'DFC', 'LD', 'CAI', 'CAD', 'MCD', 'MI', 'MC', 'MD',
          'MCO', 'EI', 'ED', 'SD', 'DC',
        ];
        if (posicion && !validas.includes(posicion)) {
          return res.status(400).json({ error: 'Posición inválida' });
        }
        data.posicion = posicion || null;
      }

      const jugador = await prisma.jugador.update({
        where: { id },
        data,
      });
      return res.status(200).json(jugador);
    }
    if (req.method === 'DELETE') {
      const id = Number(req.query?.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ error: 'Id inválido' });
      }

      const partidosJugados = await prisma.participacionPartido.count({
        where: { jugadorId: id },
      });
      if (partidosJugados > 0) {
        return res.status(400).json({
          error:
            'No se puede eliminar: ya jugó partidos. Usá "Desactivar" en su lugar.',
        });
      }

      await prisma.jugador.delete({ where: { id } });
      return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
