import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal from './Modal'
import ConfirmarAccion from './ConfirmarAccion'
import FotoRegistro from './FotoRegistro'
import { confirmarRegistro, eliminarRegistro, subirRegistro } from '../api/registros'
import { formatearDia } from '../utils/etiquetas'

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png']
const MAXIMO_MB = 5
const MACROS = [
  ['calorias', 'Calorías'],
  ['proteinas', 'Proteínas (g)'],
  ['carbohidratos', 'Carbohidratos (g)'],
  ['grasas', 'Grasas (g)'],
]

const hoy = () => {
  const fecha = new Date()
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
}

const desdeAlimento = (alimento) => ({
  nombre: alimento.nombre ?? '',
  porcion: alimento.porcion ?? '',
  calorias: String(alimento.calorias ?? 0),
  proteinas: String(alimento.proteinas ?? 0),
  carbohidratos: String(alimento.carbohidratos ?? 0),
  grasas: String(alimento.grasas ?? 0),
})

const alimentoVacio = () => desdeAlimento({})

function paraEnviar(alimentos) {
  if (alimentos.length === 0) throw new Error('Agrega al menos un alimento para confirmar.')
  return alimentos.map((alimento) => {
    const nombre = alimento.nombre.trim()
    if (!nombre) throw new Error('Cada alimento necesita un nombre.')
    const enviado = { nombre }
    if (alimento.porcion.trim()) enviado.porcion = alimento.porcion.trim()
    for (const [campo] of MACROS) {
      const valor = Number(alimento[campo] === '' ? 0 : alimento[campo])
      if (!Number.isFinite(valor) || valor < 0) {
        throw new Error('Calorías, proteínas, carbohidratos y grasas deben ser números mayores o iguales a 0.')
      }
      enviado[campo] = valor
    }
    return enviado
  })
}

const campo = 'border border-slate-300 px-2 py-1.5 text-sm font-normal focus:outline-none focus:border-accent w-full'
const botonSecundario =
  'border border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white disabled:opacity-50 text-sm font-semibold px-4 py-2 transition-colors'

export default function RegistroFoto({ titulo, cicloId, dia, tipoComida, fechaInicio, registro, editable, onCambio, onCerrar }) {
  const [actual, setActual] = useState(registro)
  const [alimentos, setAlimentos] = useState(() => (registro?.alimentos ?? []).map(desdeAlimento))
  const [archivo, setArchivo] = useState(null)
  const [fecha, setFecha] = useState(hoy)
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false)

  const minimo = new Date(fechaInicio).toISOString().slice(0, 10)
  const soloLectura = !editable || Boolean(actual?.confirmado)

  function elegirArchivo(evento) {
    const elegido = evento.target.files?.[0] ?? null
    setError(null)
    if (!elegido) return setArchivo(null)
    if (!TIPOS_PERMITIDOS.includes(elegido.type)) {
      evento.target.value = ''
      setArchivo(null)
      return setError('La foto debe ser JPG o PNG.')
    }
    if (elegido.size > MAXIMO_MB * 1024 * 1024) {
      evento.target.value = ''
      setArchivo(null)
      return setError(`La foto no puede superar ${MAXIMO_MB} MB.`)
    }
    setArchivo(elegido)
  }

  async function subir(evento) {
    evento.preventDefault()
    if (!archivo) return setError('Elige una foto JPG o PNG.')
    setEnviando(true)
    setError(null)
    const formulario = new FormData()
    formulario.append('cicloId', cicloId)
    formulario.append('dia', String(dia))
    formulario.append('tipoComida', tipoComida)
    formulario.append('fechaConsumo', fecha)
    formulario.append('imagen', archivo)
    try {
      const creado = await subirRegistro(formulario)
      setActual(creado)
      setAlimentos((creado.alimentos ?? []).map(desdeAlimento))
      onCambio()
    } catch (err) {
      setError(err.message)
      if (err.status === 409) onCambio()
    } finally {
      setEnviando(false)
    }
  }

  function cambiarAlimento(indice, nombre, valor) {
    setAlimentos((lista) => lista.map((alimento, i) => (i === indice ? { ...alimento, [nombre]: valor } : alimento)))
  }

  async function confirmar() {
    setError(null)
    let datos
    try {
      datos = paraEnviar(alimentos)
    } catch (err) {
      return setError(err.message)
    }
    setEnviando(true)
    try {
      await confirmarRegistro(actual.id, datos)
      onCambio()
      onCerrar()
    } catch (err) {
      setError(err.message)
      if (err.status === 409) onCambio()
      setEnviando(false)
    }
  }

  async function borrar() {
    setEliminando(true)
    try {
      await eliminarRegistro(actual.id)
      onCambio()
      onCerrar()
    } catch (err) {
      setError(err.message)
      onCambio()
      setEliminando(false)
      setConfirmandoBorrado(false)
    }
  }

  if (confirmandoBorrado) {
    return (
      <ConfirmarAccion
        titulo="¿Eliminar esta foto?"
        mensaje="Se borrará la foto con sus alimentos. Después podrás subir otra."
        textoConfirmar="Sí, eliminar"
        advertencia
        enviando={eliminando}
        onConfirmar={borrar}
        onCerrar={() => setConfirmandoBorrado(false)}
      />
    )
  }

  return (
    <Modal idTitulo="registro-titulo" bloqueado={enviando} onCerrar={onCerrar} ancho="max-w-2xl">
      <h2 id="registro-titulo" className="text-lg font-semibold text-navy-900 mb-4">
        {titulo}
      </h2>

      {error && <p className="mb-4 bg-red-50 text-red-700 text-sm px-3 py-2">{error}</p>}

      {!actual && (
        <form onSubmit={subir} className="flex flex-col gap-4">
          {enviando ? (
            <p className="bg-accent/15 text-navy-900 text-sm px-4 py-6 text-center">Analizando tu foto...</p>
          ) : (
            <>
              <label className="flex flex-col gap-1 text-sm text-navy-900">
                Foto de la comida (JPG o PNG, máximo {MAXIMO_MB} MB)
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png"
                  onChange={elegirArchivo}
                  className="border border-slate-300 px-3 py-2 text-sm font-normal"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-navy-900">
                Fecha de consumo
                <input
                  type="date"
                  required
                  min={minimo}
                  max={hoy()}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="border border-slate-300 px-3 py-2 text-sm font-normal focus:outline-none focus:border-accent"
                />
              </label>
            </>
          )}
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" disabled={enviando} onClick={onCerrar} className={botonSecundario}>
              Cerrar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="bg-accent hover:bg-accent-light disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 transition-colors"
            >
              {enviando ? 'Analizando...' : 'Subir y analizar'}
            </button>
          </div>
        </form>
      )}

      {actual && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row gap-5">
            <FotoRegistro registroId={actual.id} className="w-full sm:w-56 h-56 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide text-slate-400">Fecha de consumo</p>
              <p className="text-sm text-navy-900 mb-3">{formatearDia(actual.fechaConsumo)}</p>
              <span
                className={`px-2.5 py-1 text-xs font-semibold ${
                  actual.confirmado ? 'bg-navy-700/10 text-navy-700' : 'bg-accent/15 text-accent'
                }`}
              >
                {actual.confirmado ? 'Confirmada' : 'Por confirmar'}
              </span>
              {!soloLectura && alimentos.length === 0 && (
                <p className="mt-3 text-sm text-slate-600">No se detectaron alimentos en la foto. Agrégalos manualmente.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-navy-900 mb-3">Alimentos</h3>

            {soloLectura ? (
              alimentos.length === 0 ? (
                <p className="text-sm text-slate-500">Esta foto no tiene alimentos registrados.</p>
              ) : (
                <ul className="divide-y divide-slate-100 text-sm">
                  {alimentos.map((alimento, indice) => (
                    <li key={indice} className="py-2">
                      <p className="font-semibold text-navy-900">
                        {alimento.nombre}
                        {alimento.porcion && <span className="font-normal text-slate-500"> · {alimento.porcion}</span>}
                      </p>
                      <p className="text-xs text-slate-500">
                        {alimento.calorias} kcal · P {alimento.proteinas} g · C {alimento.carbohidratos} g · G {alimento.grasas} g
                      </p>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <div className="flex flex-col gap-4">
                {alimentos.map((alimento, indice) => (
                  <div key={indice} className="border border-slate-200 p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1 text-xs text-navy-900">
                        Nombre
                        <input
                          type="text"
                          maxLength={120}
                          value={alimento.nombre}
                          onChange={(e) => cambiarAlimento(indice, 'nombre', e.target.value)}
                          className={campo}
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs text-navy-900">
                        Porción (opcional)
                        <input
                          type="text"
                          maxLength={60}
                          value={alimento.porcion}
                          onChange={(e) => cambiarAlimento(indice, 'porcion', e.target.value)}
                          className={campo}
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      {MACROS.map(([nombre, etiqueta]) => (
                        <label key={nombre} className="flex flex-col gap-1 text-xs text-navy-900">
                          {etiqueta}
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={alimento[nombre]}
                            onChange={(e) => cambiarAlimento(indice, nombre, e.target.value)}
                            className={campo}
                          />
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAlimentos((lista) => lista.filter((_, i) => i !== indice))}
                      className="mt-3 flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline"
                    >
                      <Trash2 size={14} />
                      Quitar alimento
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setAlimentos((lista) => [...lista, alimentoVacio()])}
                  className="self-start flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-accent transition-colors"
                >
                  <Plus size={16} />
                  Agregar alimento
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              {editable && (
                <button
                  type="button"
                  disabled={enviando}
                  onClick={() => setConfirmandoBorrado(true)}
                  className="border border-red-600 text-red-700 hover:bg-red-600 hover:text-white disabled:opacity-50 text-sm font-semibold px-4 py-2 transition-colors"
                >
                  Eliminar foto
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <button data-foco-inicial type="button" disabled={enviando} onClick={onCerrar} className={botonSecundario}>
                Cerrar
              </button>
              {!soloLectura && (
                <button
                  type="button"
                  disabled={enviando}
                  onClick={confirmar}
                  className="bg-accent hover:bg-accent-light disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 transition-colors"
                >
                  {enviando ? 'Confirmando...' : 'Confirmar'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
