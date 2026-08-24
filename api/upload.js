import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const filename = req.query?.filename;
  if (!filename) {
    return res.status(400).json({ error: 'Falta el nombre del archivo' });
  }
  if (!req.body) {
    return res.status(400).json({ error: 'Falta el archivo' });
  }

  try {
    const blob = await put(filename, req.body, {
      access: 'public',
      addRandomSuffix: true,
      contentType: req.headers['content-type'] || 'application/octet-stream',
    });
    return res.status(200).json(blob);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'No se pudo subir la imagen' });
  }
}