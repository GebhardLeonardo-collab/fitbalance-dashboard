import { useState } from 'react'
import Modal from './Modal'
import { crearCliente } from '../api/clientes'
import { OBJETIVOS } from '../utils/etiquetas'
import { rangoFechaNacimiento, validarFechaNacimiento } from '../utils/validaciones'

const PESO_MINIMO = 30
const PESO_MAXIMO = 300
const ESTATURA_MINIMA_M = 1.2
const ESTATURA_MAXIMA_M = 2.3

const VACIO = {
  nombre: '',
  email: '',
  passwordTemporal: '',
  fechaNacimiento: '',
  pesoKg: '',
  estaturaM: '',
  objetivo: '',
  consentimiento: false,
}

const MENSAJE_ESTATURA = 'Ingresa la estatura en metros, entre 1.20 y 2.30, por ejemplo 1.75'

function estaturaEnMetros(texto) {
  const normalizado = texto.trim().replace(',', '.')
  if (!/^\d*\.?\d+$/.test(normalizado)) return null
  const metros = Number(normalizado)
  return metros >= ESTATURA_MINIMA_M && metros <= ESTATURA_MAXIMA_M ? metros : null
}

const campo = 'border border-slate-300 px-3 py-2 text-sm font-normal focus:outline-none focus:border-accent'
const etiqueta = 'flex flex-col gap-1 text-sm text-navy-900'

export default function NuevoCliente({ onCerrar, onCreado }) {
  const [valores, setValores] = useState(VACIO)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const rangoNacimiento = rangoFechaNacimiento()

  const cambiar = (nombre) => (evento) =>
    setValores((actuales) => ({
      ...actuales,
      [nombre]: evento.target.type === 'checkbox' ? evento.target.checked : evento.target.value,
    }))

  async function enviar(evento) {
    evento.preventDefault()
    if (!valores.consentimiento) return setError('Debes confirmar que el cliente acepta el tratamiento de sus datos.')
    const errorFecha = validarFechaNacimiento(valores.fechaNacimiento)
    if (errorFecha) return setError(errorFecha)
    const peso = Number(valores.pesoKg)
    if (!(peso >= PESO_MINIMO && peso <= PESO_MAXIMO)) return setError(`El peso debe estar entre ${PESO_MINIMO} y ${PESO_MAXIMO} kg.`)
    const metros = estaturaEnMetros(valores.estaturaM)
    if (metros === null) return setError(MENSAJE_ESTATURA)
    setEnviando(true)
    setError(null)
    const datos = {
      nombre: valores.nombre.trim(),
      email: valores.email.trim(),
      passwordTemporal: valores.passwordTemporal,
      consentimiento: true,
      fechaNacimiento: valores.fechaNacimiento,
      pesoKg: peso,
      estaturaCm: Math.round(metros * 100),
      objetivo: valores.objetivo,
    }
    try {
      await crearCliente(datos)
      onCreado()
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <Modal idTitulo="nuevo-cliente-titulo" bloqueado={enviando} onCerrar={onCerrar} ancho="max-w-lg">
      <h2 id="nuevo-cliente-titulo" className="text-lg font-semibold text-navy-900 mb-4">
        Nuevo cliente
      </h2>

      {error && <p className="mb-4 bg-red-50 text-red-700 text-sm px-3 py-2">{error}</p>}

      <form onSubmit={enviar} className="flex flex-col gap-4">
        <label className={etiqueta}>
          Nombre
          <input type="text" required maxLength={120} value={valores.nombre} onChange={cambiar('nombre')} className={campo} />
        </label>
        <label className={etiqueta}>
          Correo
          <input type="email" required autoComplete="off" value={valores.email} onChange={cambiar('email')} className={campo} />
        </label>
        <label className={etiqueta}>
          Contraseña temporal (mínimo 8 caracteres)
          <input
            type="text"
            required
            minLength={8}
            autoComplete="off"
            value={valores.passwordTemporal}
            onChange={cambiar('passwordTemporal')}
            className={campo}
          />
          <span className="text-xs text-slate-500 font-normal">El cliente deberá cambiarla en su primer ingreso.</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className={etiqueta}>
            Fecha de nacimiento
            <input type="date" required min={rangoNacimiento.minima} max={rangoNacimiento.maxima} value={valores.fechaNacimiento} onChange={cambiar('fechaNacimiento')} className={campo} />
          </label>
          <label className={etiqueta}>
            Objetivo
            <select required value={valores.objetivo} onChange={cambiar('objetivo')} className={`${campo} bg-white`}>
              <option value="">Selecciona...</option>
              {Object.entries(OBJETIVOS).map(([valor, texto]) => (
                <option key={valor} value={valor}>
                  {texto}
                </option>
              ))}
            </select>
          </label>
          <label className={etiqueta}>
            Peso (kg)
            <input type="number" required min={PESO_MINIMO} max={PESO_MAXIMO} step="any" value={valores.pesoKg} onChange={cambiar('pesoKg')} className={campo} />
          </label>
          <label className={etiqueta}>
            Estatura (m)
            <input
              type="text"
              inputMode="decimal"
              required
              value={valores.estaturaM}
              onChange={cambiar('estaturaM')}
              className={campo}
            />
          </label>
        </div>

        <label className="flex items-start gap-3 text-sm text-navy-900">
          <input
            type="checkbox"
            required
            checked={valores.consentimiento}
            onChange={cambiar('consentimiento')}
            className="mt-0.5 h-4 w-4 accent-accent"
          />
          El cliente acepta el tratamiento de sus datos
        </label>

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={enviando}
            onClick={onCerrar}
            className="border border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white disabled:opacity-50 text-sm font-semibold px-4 py-2 transition-colors"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="bg-accent hover:bg-accent-light disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 transition-colors"
          >
            {enviando ? 'Creando...' : 'Crear cliente'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
