import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { EVENTO_NOTIFICACIONES, contarNoLeidas } from '../api/notificaciones'

const INTERVALO_MS = 30000

export default function Campana() {
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

  return (
    <Link
      to="/notificaciones"
      aria-label={`Notificaciones: ${noLeidas} sin leer`}
      className="relative p-2 text-navy-900 hover:text-accent transition-colors"
    >
      <Bell size={26} />
      {noLeidas > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-accent text-white text-[11px] font-semibold flex items-center justify-center">
          {noLeidas > 99 ? '99+' : noLeidas}
        </span>
      )}
    </Link>
  )
}
