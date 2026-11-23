import { descargarPdfVeredicto } from '../api/ciclos'

export async function guardarPdfVeredicto(cicloId, nombreArchivo) {
  const archivo = await descargarPdfVeredicto(cicloId)
  const url = URL.createObjectURL(archivo)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
