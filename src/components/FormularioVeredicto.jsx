import { useState } from 'react'
import ConfirmarAccion from './ConfirmarAccion'
import { emitirVeredicto } from '../api/ciclos'
import { EVALUACIONES } from '../utils/etiquetas'

const MAXIMO = 2000

const campo = 'border border-slate-300 px-3 py-2 text-sm font-normal focus:outline-none focus:border-accent w-full'

function CampoTexto({ etiqueta, valor, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-navy-900">
      {etiqueta} (opcional)
      <textarea rows={4} maxLength={MAXIMO} value={valor} onChange={(e) => onChange(e.target.value)} className={campo} />
      <span className="text-xs text-slate-500 self-end">
        {valor.length}/{MAXIMO}
      </span>
    </label>
  )
}

export default function FormularioVeredicto({ cicloId, onEmitido }) {
  const [evaluacion, setEvaluacion] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [sustituciones, setSustituciones] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  function pedirConfirmacion(evento) {
    evento.preventDefault()
    if (!evaluacion) return setError('Elige una evaluación para emitir el veredicto.')
    setError(null)
    setConfirmando(true)
  }

  async function emitir() {
    setEnviando(true)
    const veredicto = { evaluacion }
    if (observaciones.trim()) veredicto.observaciones = observaciones.trim()
    if (sustituciones.trim()) veredicto.sustituciones = sustituciones.trim()
    try {
      await emitirVeredicto(cicloId, veredicto)
      await onEmitido()
    } catch (err) {
      setError(err.message)
      setEnviando(false)
      setConfirmando(false)
    }
  }

  return (
    <form onSubmit={pedirConfirmacion} className="bg-white p-6 shadow-lg flex flex-col gap-5">
      <h3 className="font-semibold text-navy-900">Emitir veredicto</h3>

      {error && <p className="bg-red-50 text-red-700 text-sm px-3 py-2">{error}</p>}

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm text-navy-900 mb-1">Evaluación</legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(EVALUACIONES).map(([valor, texto]) => (
            <label
              key={valor}
              className={`flex items-center gap-2 border px-3 py-2 text-sm cursor-pointer transition-colors ${
                evaluacion === valor ? 'border-accent bg-accent/10 text-navy-900 font-semibold' : 'border-slate-300 text-slate-600'
              }`}
            >
              <input
                type="radio"
                name="evaluacion"
                value={valor}
                checked={evaluacion === valor}
                onChange={() => setEvaluacion(valor)}
                className="accent-accent"
              />
              {texto}
            </label>
          ))}
        </div>
      </fieldset>

      <CampoTexto etiqueta="Observaciones" valor={observaciones} onChange={setObservaciones} />
      <CampoTexto etiqueta="Sustituciones sugeridas" valor={sustituciones} onChange={setSustituciones} />

      <div>
        <button
          type="submit"
          className="bg-accent hover:bg-accent-light text-white text-sm font-semibold px-5 py-2.5 transition-colors"
        >
          Emitir veredicto
        </button>
      </div>

      {confirmando && (
        <ConfirmarAccion
          titulo="¿Emitir el veredicto?"
          mensaje="Una vez emitido no podrás cambiarlo."
          textoConfirmar="Sí, emitir veredicto"
          enviando={enviando}
          onConfirmar={emitir}
          onCerrar={() => setConfirmando(false)}
        />
      )}
    </form>
  )
}
