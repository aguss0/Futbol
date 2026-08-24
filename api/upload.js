import { put } from '@vercel/blob';

function bufferDesdeRequest(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const filename = req.query?.filename;
  if (!filename) {
    return res.status(400).json({ error: 'Falta el nombre del archivo' });
  }

  try {
    const buffer = await bufferDesdeRequest(req);
    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ error: 'El archivo llegó vacío' });
    }

    const blob = await put(filename, buffer, {
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