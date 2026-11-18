import { useState } from 'react'
import { useSesion } from '../context/useSesion'

const MINIMO = 8

export default function CambiarPassword() {
  const { cambiarPassword, cerrarSesion } = useSesion()
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  async function enviar(evento) {
    evento.preventDefault()
    if (nueva.length < MINIMO) return setError(`La contraseña nueva debe tener al menos ${MINIMO} caracteres.`)
    if (nueva !== confirmacion) return setError('La confirmación no coincide con la contraseña nueva.')
    if (nueva === actual) return setError('La contraseña nueva debe ser distinta de la temporal.')
    setEnviando(true)
    setError(null)
    try {
      await cambiarPassword(actual, nueva)
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  const campo = 'border border-slate-300 px-3 py-2 focus:outline-none focus:border-accent'

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-600 to-navy-800 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-white p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl text-navy-900 mb-1">Cambiar contraseña</h1>
        <p className="text-sm text-slate-500 mb-6">Por seguridad, debes reemplazar la contraseña temporal antes de continuar.</p>

        {error && <p className="mb-4 bg-red-50 text-red-700 text-sm px-3 py-2">{error}</p>}

        <form onSubmit={enviar} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-navy-900">
            Contraseña temporal
            <input type="password" required autoComplete="current-password" value={actual} onChange={(e) => setActual(e.target.value)} className={campo} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-navy-900">
            Contraseña nueva (mínimo {MINIMO} caracteres)
            <input type="password" required autoComplete="new-password" value={nueva} onChange={(e) => setNueva(e.target.value)} className={campo} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-navy-900">
            Confirmar contraseña nueva
            <input type="password" required autoComplete="new-password" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} className={campo} />
          </label>
          <button
            type="submit"
            disabled={enviando}
            className="bg-accent hover:bg-accent-light disabled:opacity-60 text-white font-semibold py-2.5 transition-colors"
          >
            {enviando ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => cerrarSesion()}
          className="mt-6 w-full text-sm text-accent font-semibold hover:underline"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
