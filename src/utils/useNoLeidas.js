import { useEffect, useState } from 'react'
import { EVENTO_NOTIFICACIONES, contarNoLeidas } from '../api/notificaciones'

const INTERVALO_MS = 30000

export function useNoLeidas() {
  const [noLeidas, setNoLeidas] = useState(0)

  useEffect(() => {
    let activo = true
    const actualizar = () =>
      contarNoLeidas()
        .then((respuesta) => {
          if (activo) setNoLeidas(respuesta.noLeidas)
        })
        .catch(() => {})
    const alVolver = () => {
      if (document.visibilityState === 'visible') actualizar()
    }

    actualizar()
    const intervalo = setInterval(actualizar, INTERVALO_MS)
    document.addEventListener('visibilitychange', alVolver)
    window.addEventListener(EVENTO_NOTIFICACIONES, actualizar)

    return () => {
      activo = false
      clearInterval(intervalo)
      document.removeEventListener('visibilitychange', alVolver)
      window.removeEventListener(EVENTO_NOTIFICACIONES, actualizar)
    }
  }, [])

  return noLeidas
}
