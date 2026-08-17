import { prisma } from '../_db.js';

export default async function handler(req, res) {
  const id = Number(req.query.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Id inválido' });
  }

  try {
    if (req.method === 'GET') {
      const partido = await prisma.partido.findUnique({
        where: { id },
        include: { participaciones: { include: { jugador: true } } },
      });
      if (!partido) {
        return res.status(404).json({ error: 'Partido no encontrado' });
      }
      return res.status(200).json(partido);
    }

    if (req.method === 'PUT') {
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

      const nuevasParticipaciones = [
        ...equipoA.map((jugadorId) => ({ jugadorId, equipo: 'A' })),
        ...equipoB.map((jugadorId) => ({ jugadorId, equipo: 'B' })),
      ];

      const partido = await prisma.$transaction(async (tx) => {
        await tx.participacionPartido.deleteMany({ where: { partidoId: id } });
        return tx.partido.update({
          where: { id },
          data: {
            fecha: new Date(fecha),
            cancha: cancha || null,
            golesEquipoA,
            golesEquipoB,
            participaciones: { create: nuevasParticipaciones },
          },
          include: { participaciones: { include: { jugador: true } } },
        });
      });

      return res.status(200).json(partido);
    }

    if (req.method === 'DELETE') {
      await prisma.partido.delete({ where: { id } });
      return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
