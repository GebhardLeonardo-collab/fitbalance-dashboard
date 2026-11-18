import { useEffect, useState } from 'react'
import { obtenerImagen } from '../api/registros'

export default function FotoRegistro({ registroId, className = '' }) {
  const [foto, setFoto] = useState({ id: null, url: null })

  useEffect(() => {
    let activo = true
    let url = null
    obtenerImagen(registroId)
      .then((blob) => {
        url = URL.createObjectURL(blob)
        if (activo) setFoto({ id: registroId, url })
        else URL.revokeObjectURL(url)
      })
      .catch(() => {
        if (activo) setFoto({ id: registroId, url: null })
      })
    return () => {
      activo = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [registroId])

  const marco = `flex items-center justify-center bg-slate-100 text-xs text-slate-500 ${className}`

  if (foto.id !== registroId) return <div className={marco}>Cargando...</div>
  if (!foto.url) return <div className={marco}>No se pudo cargar la foto</div>
  return <img src={foto.url} alt="Foto de la comida" className={`object-cover ${className}`} />
}
