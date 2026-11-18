import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrarGimnasio, registrarNutricionista } from '../api/auth'

const CAMPOS = {
  gimnasio: [
    { nombre: 'nombre', etiqueta: 'Nombre del gimnasio', requerido: true, maximo: 120 },
    { nombre: 'email', etiqueta: 'Correo', tipo: 'email', requerido: true },
    { nombre: 'password', etiqueta: 'Contraseña (mínimo 8 caracteres)', tipo: 'password', requerido: true, minimo: 8 },
    { nombre: 'ciudad', etiqueta: 'Ciudad', requerido: true, maximo: 80 },
    { nombre: 'direccion', etiqueta: 'Dirección', maximo: 200 },
    { nombre: 'telefono', etiqueta: 'Teléfono', tipo: 'tel' },
  ],
  nutricionista: [
    { nombre: 'nombre', etiqueta: 'Nombre completo', requerido: true, maximo: 120 },
    { nombre: 'email', etiqueta: 'Correo', tipo: 'email', requerido: true },
    { nombre: 'password', etiqueta: 'Contraseña (mínimo 8 caracteres)', tipo: 'password', requerido: true, minimo: 8 },
    { nombre: 'ciudad', etiqueta: 'Ciudad', requerido: true, maximo: 80 },
    { nombre: 'especialidad', etiqueta: 'Especialidad', maximo: 80 },
    { nombre: 'aniosExperiencia', etiqueta: 'Años de experiencia', tipo: 'number' },
    { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea', maximo: 1000 },
  ],
}

const REGISTRAR = { gimnasio: registrarGimnasio, nutricionista: registrarNutricionista }

function datosParaEnviar(valores) {
  const datos = {}
  for (const [campo, valor] of Object.entries(valores)) {
    const limpio = typeof valor === 'string' && campo !== 'password' ? valor.trim() : valor
    if (limpio === '') continue
    datos[campo] = campo === 'aniosExperiencia' ? Number(limpio) : limpio
  }
  return datos
}

export default function Registro() {
  const navegar = useNavigate()
  const [tipo, setTipo] = useState('gimnasio')
  const [valores, setValores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  function cambiarTipo(nuevo) {
    setTipo(nuevo)
    setError(null)
  }

  async function enviar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    const datos = datosParaEnviar(Object.fromEntries(CAMPOS[tipo].map(({ nombre }) => [nombre, valores[nombre] ?? ''])))
    try {
      await REGISTRAR[tipo](datos)
      navegar('/login', { state: { email: datos.email, mensaje: 'Cuenta creada. Ya puedes iniciar sesión.' } })
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-600 to-navy-800 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl text-navy-900 mb-1">Crear cuenta</h1>
        <p className="text-sm text-slate-500 mb-6">Regístrate como gimnasio o como nutricionista</p>

        <div className="grid grid-cols-2 mb-6 border border-slate-200">
          {['gimnasio', 'nutricionista'].map((opcion) => (
            <button
              key={opcion}
              type="button"
              onClick={() => cambiarTipo(opcion)}
              className={`py-2 text-sm font-semibold transition-colors ${
                tipo === opcion ? 'bg-navy-800 text-white' : 'text-navy-900 hover:bg-slate-50'
              }`}
            >
              {opcion === 'gimnasio' ? 'Gimnasio' : 'Nutricionista'}
            </button>
          ))}
        </div>

        {error && <p className="mb-4 bg-red-50 text-red-700 text-sm px-3 py-2">{error}</p>}

        <form onSubmit={enviar} className="flex flex-col gap-4">
          {CAMPOS[tipo].map((campo) => {
            const propiedades = {
              required: campo.requerido,
              minLength: campo.minimo,
              maxLength: campo.maximo,
              value: valores[campo.nombre] ?? '',
              onChange: (e) => setValores((actuales) => ({ ...actuales, [campo.nombre]: e.target.value })),
              className: 'border border-slate-300 px-3 py-2 focus:outline-none focus:border-accent',
            }
            return (
              <label key={campo.nombre} className="flex flex-col gap-1 text-sm text-navy-900">
                {campo.etiqueta}
                {campo.tipo === 'textarea' ? (
                  <textarea rows={3} {...propiedades} />
                ) : (
                  <input
                    type={campo.tipo ?? 'text'}
                    min={campo.tipo === 'number' ? 0 : undefined}
                    max={campo.tipo === 'number' ? 70 : undefined}
                    step={campo.tipo === 'number' ? 1 : undefined}
                    autoComplete={campo.tipo === 'password' ? 'new-password' : undefined}
                    {...propiedades}
                  />
                )}
              </label>
            )
          })}
          <button
            type="submit"
            disabled={enviando}
            className="bg-accent hover:bg-accent-light disabled:opacity-60 text-white font-semibold py-2.5 transition-colors"
          >
            {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500 text-center">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-accent font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
