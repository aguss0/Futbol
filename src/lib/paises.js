// Bandera: no requiere API key, se arma directo con el código ISO 3166-1 alpha-2.
export function bandeUrl(code) {
  if (!code) return null;
  return `https://flagcdn.com/48x36/${code.toLowerCase()}.png`;
}

// Lista completa de países desde restcountries.com (gratis, sin API key).
// Se cachea en memoria para no repetir el fetch cada vez que se abre el panel.
let cachePromise = null;

export function obtenerPaises() {
  if (!cachePromise) {
    cachePromise = fetch(
      'https://restcountries.com/v3.1/all?fields=name,cca2,translations'
    )
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo obtener la lista de países');
        return res.json();
      })
      .then((data) =>
        data
          .filter((p) => p.cca2)
          .map((p) => ({
            code: p.cca2,
            nombre: p.translations?.spa?.common || p.name.common,
          }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      )
      .catch((err) => {
        cachePromise = null; // permite reintentar si falló
        throw err;
      });
  }
  return cachePromise;
}