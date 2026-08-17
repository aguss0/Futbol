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
      const { id, activo } = req.body || {};
      if (typeof id !== 'number') {
        return res.status(400).json({ error: 'Falta id de jugador' });
      }
      const jugador = await prisma.jugador.update({
        where: { id },
        data: { activo },
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
