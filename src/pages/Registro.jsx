import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrarGimnasio, registrarNutricionista } from '../api/auth'
import { normalizarTelefono, validarCedula, validarCelular, validarTelefonoGimnasio } from '../utils/validaciones'

const MINIMO_PASSWORD = 8
const AYUDA_NOMBRE_COMPLETO = 'Escribe tus nombres y apellidos completos.'
const OBLIGATORIO = 'Este campo es obligatorio.'

const CAMPOS = {
  gimnasio: [
    { nombre: 'nombre', etiqueta: 'Nombre del gimnasio', requerido: true, maximo: 120 },
    {
      nombre: 'responsable',
      etiqueta: 'Responsable: nombres y apellidos completos',
      ayuda: 'Nombre completo de la persona a cargo del gimnasio.',
      requerido: true,
      minimo: 3,
      maximo: 100,
    },
    { nombre: 'email', etiqueta: 'Correo', tipo: 'email', requerido: true },
    { nombre: 'password', etiqueta: `Contraseña (mínimo ${MINIMO_PASSWORD} caracteres)`, tipo: 'password', requerido: true, minimo: MINIMO_PASSWORD },
    { nombre: 'ciudad', etiqueta: 'Ciudad', requerido: true, maximo: 80 },
    { nombre: 'direccion', etiqueta: 'Dirección', requerido: true, maximo: 200 },
    {
      nombre: 'telefono',
      etiqueta: 'Teléfono',
      ayuda: 'Celular (09 + 8 dígitos) o convencional (código de provincia + 7 dígitos, por ejemplo 022451180).',
      tipo: 'tel',
      requerido: true,
      validar: validarTelefonoGimnasio,
    },
  ],
  nutricionista: [
    { nombre: 'nombre', etiqueta: 'Nombres y apellidos completos', ayuda: AYUDA_NOMBRE_COMPLETO, requerido: true, maximo: 120 },
    {
      nombre: 'cedula',
      etiqueta: 'Cédula',
      ayuda: '10 dígitos, sin guiones ni espacios.',
      requerido: true,
      maximo: 10,
      soloDigitos: true,
      validar: validarCedula,
    },
    { nombre: 'telefono', etiqueta: 'Celular', ayuda: '10 dígitos, empieza con 09.', tipo: 'tel', requerido: true, validar: validarCelular },
    { nombre: 'email', etiqueta: 'Correo', tipo: 'email', requerido: true },
    { nombre: 'password', etiqueta: `Contraseña (mínimo ${MINIMO_PASSWORD} caracteres)`, tipo: 'password', requerido: true, minimo: MINIMO_PASSWORD },
    { nombre: 'ciudad', etiqueta: 'Ciudad', requerido: true, maximo: 80 },
    { nombre: 'especialidad', etiqueta: 'Especialidad', maximo: 80 },
    {
      nombre: 'aniosExperiencia',
      etiqueta: 'Años de experiencia',
      tipo: 'number',
      validar: (texto) => (/^\d+$/.test(texto) && Number(texto) <= 70 ? null : 'Ingresa un número entero entre 0 y 70.'),
    },
    { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea', maximo: 1000 },
  ],
}

const REGISTRAR = { gimnasio: registrarGimnasio, nutricionista: registrarNutricionista }
const TELEFONICOS = ['telefono']

function errorDelCampo(campo, valor = '') {
  const texto = campo.tipo === 'password' ? valor : valor.trim()
  if (!texto) return campo.requerido ? OBLIGATORIO : null
  if (campo.minimo && texto.length < campo.minimo) return `Debe tener al menos ${campo.minimo} caracteres.`
  return campo.validar ? campo.validar(texto) : null
}

function datosParaEnviar(campos, valores) {
  const datos = {}
  for (const { nombre } of campos) {
    const valor = valores[nombre] ?? ''
    const limpio = nombre === 'password' ? valor : valor.trim()
    if (limpio === '') continue
    if (nombre === 'aniosExperiencia') datos[nombre] = Number(limpio)
    else datos[nombre] = TELEFONICOS.includes(nombre) ? normalizarTelefono(limpio) : limpio
  }
  return datos
}

function campoDelError(campos, error) {
  const faltantes = error.detalles?.faltantes
  if (faltantes?.length) return Object.fromEntries(faltantes.filter((n) => campos.some((c) => c.nombre === n)).map((n) => [n, OBLIGATORIO]))
  const propio = campos.find(({ nombre }) => error.message.startsWith(`${nombre} `))
  if (propio) return { [propio.nombre]: error.message }
  if (/cédula/i.test(error.message) && campos.some((c) => c.nombre === 'cedula')) return { cedula: error.message }
  if (/ email /.test(error.message)) return { email: error.message }
  return {}
}

const entrada = 'border px-3 py-2 focus:outline-none focus:border-accent'

export default function Registro() {
  const navegar = useNavigate()
  const [tipo, setTipo] = useState('gimnasio')
  const [valores, setValores] = useState({})
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [registrado, setRegistrado] = useState(null)

  const campos = CAMPOS[tipo]

  function cambiarTipo(nuevo) {
    setTipo(nuevo)
    setErrores({})
    setError(null)
  }

  function cambiarValor(campo, texto) {
    const valor = campo.soloDigitos ? texto.replace(/\D/g, '') : texto
    setValores((actuales) => ({ ...actuales, [campo.nombre]: valor }))
    if (errores[campo.nombre]) setErrores((actuales) => ({ ...actuales, [campo.nombre]: errorDelCampo(campo, valor) }))
  }

  const validarAlSalir = (campo) => () =>
    setErrores((actuales) => ({ ...actuales, [campo.nombre]: errorDelCampo(campo, valores[campo.nombre]) }))

  async function enviar(evento) {
    evento.preventDefault()
    const encontrados = Object.fromEntries(campos.map((campo) => [campo.nombre, errorDelCampo(campo, valores[campo.nombre])]))
    setErrores(encontrados)
    if (Object.values(encontrados).some(Boolean)) return setError('Revisa los campos marcados.')

    setEnviando(true)
    setError(null)
    const datos = datosParaEnviar(campos, valores)
    try {
      await REGISTRAR[tipo](datos)
      setRegistrado({ email: datos.email })
    } catch (err) {
      const delCampo = campoDelError(campos, err)
      setErrores(delCampo)
      setError(Object.keys(delCampo).length > 0 ? 'Revisa los campos marcados.' : err.message)
      setEnviando(false)
    }
  }

  if (registrado) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-600 to-navy-800 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 shadow-xl">
          <h1 className="text-2xl text-navy-900 mb-4">Cuenta registrada</h1>
          <p className="mb-6 bg-accent/15 text-navy-900 text-sm px-3 py-2">
            Cuenta registrada. Queda en revisión hasta que un administrador la apruebe.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Podrás iniciar sesión cuando tu cuenta sea aprobada. Si la solicitud no se aprueba, al intentar ingresar verás el motivo.
          </p>
          <button
            type="button"
            onClick={() => navegar('/login', { state: { email: registrado.email } })}
            className="w-full bg-accent hover:bg-accent-light text-white font-semibold py-2.5 transition-colors"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
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

        <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
          {campos.map((campo) => {
            const mensaje = errores[campo.nombre]
            const propiedades = {
              maxLength: campo.maximo,
              value: valores[campo.nombre] ?? '',
              onChange: (e) => cambiarValor(campo, e.target.value),
              onBlur: validarAlSalir(campo),
              'aria-invalid': Boolean(mensaje),
              className: `${entrada} ${mensaje ? 'border-red-500' : 'border-slate-300'}`,
            }
            return (
              <label key={`${tipo}-${campo.nombre}`} className="flex flex-col gap-1 text-sm text-navy-900">
                {campo.etiqueta}
                {campo.tipo === 'textarea' ? (
                  <textarea rows={3} {...propiedades} />
                ) : (
                  <input
                    type={campo.tipo ?? 'text'}
                    inputMode={campo.soloDigitos ? 'numeric' : undefined}
                    min={campo.tipo === 'number' ? 0 : undefined}
                    max={campo.tipo === 'number' ? 70 : undefined}
                    step={campo.tipo === 'number' ? 1 : undefined}
                    autoComplete={campo.tipo === 'password' ? 'new-password' : undefined}
                    {...propiedades}
                  />
                )}
                {campo.ayuda && !mensaje && <span className="text-xs text-slate-500">{campo.ayuda}</span>}
                {mensaje && <span className="text-xs text-red-600">{mensaje}</span>}
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
