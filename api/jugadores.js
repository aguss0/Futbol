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
      const { id, activo, media, fotoUrl } = req.body || {};
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
      if (fotoUrl !== undefined) {
        data.fotoUrl = fotoUrl ? fotoUrl.trim() : null;
      }

      const jugador = await prisma.jugador.update({
        where: { id },
        data,
      });
      return res.status(200).json(jugador);
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
