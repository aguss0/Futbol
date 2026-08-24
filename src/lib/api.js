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

export async function actualizarJugador(id, campos) {
  const res = await fetch('/api/jugadores', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...campos }),
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

export async function getPartido(id) {
  const res = await fetch(`/api/partidos/${id}`);
  return manejarRespuesta(res);
}

export async function actualizarPartido(id, payload) {
  const res = await fetch(`/api/partidos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return manejarRespuesta(res);
}

export async function eliminarPartido(id) {
  const res = await fetch(`/api/partidos/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    let mensaje = 'No se pudo eliminar el partido';
    try {
      const data = await res.json();
      mensaje = data.error || mensaje;
    } catch {
      // sin body
    }
    throw new Error(mensaje);
  }
  return true;
}

export async function subirFoto(file) {
  const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!res.ok) {
    let mensaje = 'No se pudo subir la foto';
    try {
      const data = await res.json();
      mensaje = data.error || mensaje;
    } catch {
      // sin body
    }
    throw new Error(mensaje);
  }
  const data = await res.json();
  return data.url;
}