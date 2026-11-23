import { useState } from 'react'
import { Download } from 'lucide-react'
import { CICLOS_EN_CURSO, ESTADOS_CICLO, EVALUACIONES, OBJETIVOS } from '../utils/etiquetas'
import { formatearFecha, mezclarLinea } from '../utils/seguimiento'
import { guardarPdfVeredicto } from '../utils/descargas'

function TarjetaCiclo({ ciclo, permitirPdf }) {
  const [descargando, setDescargando] = useState(false)
  const [error, setError] = useState(null)

  async function descargar() {
    setDescargando(true)
    setError(null)
    try {
      await guardarPdfVeredicto(ciclo.id, `veredicto-${formatearFecha(ciclo.fechaInicio)}.pdf`)
    } catch (err) {
      setError(err.message)
    } finally {
      setDescargando(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold text-navy-900 text-sm">
          Ciclo {formatearFecha(ciclo.fechaInicio)} al {formatearFecha(ciclo.fechaFin)}
        </p>
        <span
          className={`px-2.5 py-1 text-xs font-semibold ${
            CICLOS_EN_CURSO.includes(ciclo.estado) ? 'bg-accent/15 text-accent' : 'bg-navy-700/10 text-navy-700'
          }`}
        >
          {ESTADOS_CICLO[ciclo.estado] ?? ciclo.estado}
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-1">Nutricionista: {ciclo.nutricionista?.nombre ?? '—'}</p>

      {ciclo.veredicto && (
        <div className="mt-2 text-sm text-navy-900">
          <p>
            Evaluación: <span className="font-semibold">{EVALUACIONES[ciclo.veredicto.evaluacion] ?? ciclo.veredicto.evaluacion}</span>
          </p>
          {ciclo.veredicto.sustituciones && <p className="mt-1 whitespace-pre-line">Sustituciones: {ciclo.veredicto.sustituciones}</p>}
          {ciclo.observaciones && <p className="mt-1 whitespace-pre-line">Observaciones: {ciclo.observaciones}</p>}
        </div>
      )}

      {permitirPdf && ciclo.estado === 'evaluado' && (
        <button
          type="button"
          disabled={descargando}
          onClick={descargar}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy-700 hover:text-accent disabled:opacity-50"
        >
          <Download size={14} />
          {descargando ? 'Descargando...' : 'Descargar PDF'}
        </button>
      )}
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  )
}

export default function LineaTiempo({ historial, permitirPdf = false }) {
  const items = mezclarLinea(historial)

  return (
    <div className="bg-white p-6 shadow-lg">
      <h2 className="font-semibold text-navy-900 mb-4">Línea de tiempo</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Todavía no hay ciclos ni cambios de objetivo.</p>
      ) : (
        <ol className="flex flex-col gap-5 border-l-2 border-slate-200 pl-5">
          {items.map((item, i) => (
            <li key={`${item.tipo}-${item.fecha}-${i}`} className="relative">
              <span className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full ${item.tipo === 'ciclo' ? 'bg-navy-700' : 'bg-accent'}`} />
              {item.tipo === 'ciclo' ? (
                <TarjetaCiclo ciclo={item.ciclo} permitirPdf={permitirPdf} />
              ) : (
                <div>
                  <p className="text-sm text-navy-900">
                    Objetivo cambió de {OBJETIVOS[item.cambio.objetivoAnterior] ?? 'sin definir'} a{' '}
                    {OBJETIVOS[item.cambio.objetivoNuevo] ?? item.cambio.objetivoNuevo}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{formatearFecha(item.fecha)}</p>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
