import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { restablecerPassword } from '../api/auth'

const MINIMO = 8
const MENSAJE_ENLACE = 'El enlace no es válido o venció'

const campo = 'border border-slate-300 px-3 py-2 focus:outline-none focus:border-accent'

function Tarjeta({ titulo, subtitulo, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-600 to-navy-800 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-white p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl text-navy-900 mb-1">{titulo}</h1>
        {subtitulo && <p className="text-sm text-slate-500 mb-6">{subtitulo}</p>}
        {children}
      </div>
    </div>
  )
}

const botonAcento = 'block text-center bg-accent hover:bg-accent-light text-white font-semibold py-2.5 transition-colors'

export default function RestablecerPassword() {
  const [parametros] = useSearchParams()
  const token = parametros.get('token')
  const [nueva, setNueva] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [estado, setEstado] = useState(token ? 'formulario' : 'enlaceInvalido')

  async function enviar(evento) {
    evento.preventDefault()
    if (nueva.length < MINIMO) return setError(`La contraseña nueva debe tener al menos ${MINIMO} caracteres.`)
    if (nueva !== confirmacion) return setError('La confirmación no coincide con la contraseña nueva.')
    setEnviando(true)
    setError(null)
    try {
      await restablecerPassword(token, nueva)
      setEstado('exito')
    } catch (err) {
      if (err.status === 400 && err.message === MENSAJE_ENLACE) setEstado('enlaceInvalido')
      else setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (estado === 'exito') {
    return (
      <Tarjeta titulo="Contraseña restablecida">
        <p className="mb-6 bg-accent/15 text-navy-900 text-sm px-3 py-2">
          Tu contraseña se restableció correctamente. Ya puedes iniciar sesión con la nueva.
        </p>
        <Link to="/login" className={botonAcento}>
          Ir a iniciar sesión
        </Link>
      </Tarjeta>
    )
  }

  if (estado === 'enlaceInvalido') {
    return (
      <Tarjeta titulo="Enlace no válido">
        <p className="mb-6 bg-red-50 text-red-700 text-sm px-3 py-2">{MENSAJE_ENLACE}.</p>
        <Link to="/olvide-password" className={botonAcento}>
          Pedir otro enlace
        </Link>
        <p className="mt-6 text-sm text-slate-500 text-center">
          <Link to="/login" className="text-accent font-semibold hover:underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </Tarjeta>
    )
  }

  return (
    <Tarjeta titulo="Nueva contraseña" subtitulo="Elige una contraseña nueva para tu cuenta.">
      {error && <p className="mb-4 bg-red-50 text-red-700 text-sm px-3 py-2">{error}</p>}
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-navy-900">
          Contraseña nueva (mínimo {MINIMO} caracteres)
          <input type="password" required autoComplete="new-password" value={nueva} onChange={(e) => setNueva(e.target.value)} className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-navy-900">
          Confirmar contraseña nueva
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            className={campo}
          />
        </label>
        <button
          type="submit"
          disabled={enviando}
          className="bg-accent hover:bg-accent-light disabled:opacity-60 text-white font-semibold py-2.5 transition-colors"
        >
          {enviando ? 'Guardando...' : 'Restablecer contraseña'}
        </button>
      </form>
    </Tarjeta>
  )
}
