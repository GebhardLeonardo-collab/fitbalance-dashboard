import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSesion } from '../context/useSesion'

export default function Login() {
  const { entrar, aviso } = useSesion()
  const { state } = useLocation()
  const [email, setEmail] = useState(state?.email ?? '')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  async function enviar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await entrar(email.trim(), password)
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  const mensajeInicial = error ? null : (state?.mensaje ?? aviso)

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-600 to-navy-800 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-white p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl text-navy-900 mb-1">FitBalance</h1>
        <p className="text-sm text-slate-500 mb-6">Inicia sesión para continuar</p>

        {mensajeInicial && (
          <p className="mb-4 bg-accent/15 text-navy-900 text-sm px-3 py-2">{mensajeInicial}</p>
        )}
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
          <label className="flex flex-col gap-1 text-sm text-navy-900">
            Contraseña
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-slate-300 px-3 py-2 focus:outline-none focus:border-accent"
            />
          </label>
          <button
            type="submit"
            disabled={enviando}
            className="bg-accent hover:bg-accent-light disabled:opacity-60 text-white font-semibold py-2.5 transition-colors"
          >
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500 text-center">
          ¿Eres gimnasio o nutricionista?{' '}
          <Link to="/registro" className="text-accent font-semibold hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
