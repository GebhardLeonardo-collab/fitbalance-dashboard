import { useState } from 'react'
import { Link } from 'react-router-dom'
import { olvidePassword } from '../api/auth'

const MENSAJE_GENERICO = 'Si el correo está registrado, te enviamos instrucciones.'

export default function OlvidePassword() {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [enviado, setEnviado] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await olvidePassword(email.trim())
      setEnviado(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-600 to-navy-800 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-white p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl text-navy-900 mb-1">Recuperar contraseña</h1>
        <p className="text-sm text-slate-500 mb-6">Escribe tu correo y te enviaremos un enlace para elegir una contraseña nueva.</p>

        {enviado ? (
          <>
            <p className="mb-6 bg-accent/15 text-navy-900 text-sm px-3 py-2">
              {MENSAJE_GENERICO} El enlace vence en 30 minutos.
            </p>
            <Link
              to="/login"
              state={{ email: email.trim() }}
              className="block text-center bg-accent hover:bg-accent-light text-white font-semibold py-2.5 transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </>
        ) : (
          <>
            {error && <p className="mb-4 bg-red-50 text-red-700 text-sm px-3 py-2">{error}</p>}
            <form onSubmit={enviar} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm text-navy-900">
                Correo
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-slate-300 px-3 py-2 focus:outline-none focus:border-accent"
                />
              </label>
              <button
                type="submit"
                disabled={enviando}
                className="bg-accent hover:bg-accent-light disabled:opacity-60 text-white font-semibold py-2.5 transition-colors"
              >
                {enviando ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
            <p className="mt-6 text-sm text-slate-500 text-center">
              <Link to="/login" className="text-accent font-semibold hover:underline">
                Volver al inicio de sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
