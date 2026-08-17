import { prisma } from './_db.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const limitParam = req.query?.limit;
      const limit = limitParam ? parseInt(limitParam, 10) : undefined;

      const partidos = await prisma.partido.findMany({
        orderBy: { fecha: 'desc' },
        take: Number.isFinite(limit) ? limit : undefined,
        include: {
          participaciones: {
            include: { jugador: true },
          },
        },
      });
      return res.status(200).json(partidos);
    }

    if (req.method === 'POST') {
      const { fecha, cancha, golesEquipoA, golesEquipoB, equipoA, equipoB } =
        req.body || {};

      if (!fecha) {
        return res.status(400).json({ error: 'Falta la fecha' });
      }
      if (
        typeof golesEquipoA !== 'number' ||
        typeof golesEquipoB !== 'number'
      ) {
        return res.status(400).json({ error: 'Faltan los goles' });
      }
      if (
        !Array.isArray(equipoA) ||
        !Array.isArray(equipoB) ||
        equipoA.length === 0 ||
        equipoB.length === 0
      ) {
        return res
          .status(400)
          .json({ error: 'Cada equipo necesita al menos un jugador' });
      }

      const participaciones = [
        ...equipoA.map((jugadorId) => ({ jugadorId, equipo: 'A' })),
        ...equipoB.map((jugadorId) => ({ jugadorId, equipo: 'B' })),
      ];

      const partido = await prisma.partido.create({
        data: {
          fecha: new Date(fecha),
          cancha: cancha || null,
          golesEquipoA,
          golesEquipoB,
          participaciones: {
            create: participaciones,
          },
        },
        include: {
          participaciones: { include: { jugador: true } },
        },
      });

      return res.status(201).json(partido);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
