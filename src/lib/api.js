async function manejarRespuesta(res) {
  if (!res.ok) {
    let mensaje = 'Ocurrió un error';
    try {
      const data = await res.json();
      mensaje = data.error || mensaje;
    } catch {
      // sin body
    }
    throw new Error(mensaje);
  }
  return res.json();
}

export async function getJugadores() {
  const res = await fetch('/api/jugadores');
  return manejarRespuesta(res);
}

export async function crearJugador(nombre) {
  const res = await fetch('/api/jugadores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre }),
  });
  return manejarRespuesta(res);
}

export async function toggleJugador(id, activo) {
  const res = await fetch('/api/jugadores', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, activo }),
  });
  return manejarRespuesta(res);
}

export async function getPartidos(limit) {
  const url = limit ? `/api/partidos?limit=${limit}` : '/api/partidos';
  const res = await fetch(url);
  return manejarRespuesta(res);
}

export async function crearPartido(payload) {
  const res = await fetch('/api/partidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return manejarRespuesta(res);
}
