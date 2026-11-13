const API_URL = import.meta.env.VITE_API_URL

export async function obtenerResumen() {
  const respuesta = await fetch(`${API_URL}/api/dashboard/resumen`)

  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status} al obtener el resumen del dashboard`)
  }

  return respuesta.json()
}
