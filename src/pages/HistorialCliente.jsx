import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import Estado from '../components/Estado'
import GraficaPeso from '../components/GraficaPeso'
import ResumenSeguimiento from '../components/ResumenSeguimiento'
import { CICLOS_EN_CURSO, ESTADOS_CICLO, EVALUACIONES } from '../utils/etiquetas'
import { formatearFecha, useHistorial } from '../utils/seguimiento'
import { guardarPdfVeredicto } from '../utils/descargas'

function BotonPdf({ ciclo }) {
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
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={descargando}
        onClick={descargar}
        className="inline-flex items-center gap-1 border border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white disabled:opacity-50 text-xs font-semibold px-3 py-1.5 transition-colors"
      >
        <Download size={14} />
        {descargando ? 'Descargando...' : 'PDF'}
      </button>
      {error && <span className="text-xs text-red-700 max-w-[200px] text-right">{error}</span>}
    </div>
  )
}

export default function HistorialCliente() {
  const { id } = useParams()
  const { cargando, error, historial } = useHistorial(id)

  return (
    <>
      <Link to="/clientes" className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-accent mb-4">
        <ArrowLeft size={16} />
        Clientes
      </Link>

      <Estado cargando={cargando} error={error}>
        {historial && (
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl text-navy-900">Historial de {historial.cliente.nombre ?? 'cliente'}</h1>

            <ResumenSeguimiento historial={historial} />

            {historial.pesos.length > 0 ? (
              <GraficaPeso pesos={historial.pesos} cambiosObjetivo={historial.cambiosObjetivo} />
            ) : (
              <div className="bg-white p-6 shadow-lg text-sm text-slate-500">Este cliente todavía no tiene registros de peso en tu gimnasio.</div>
            )}

            <div className="bg-white p-6 shadow-lg overflow-x-auto">
              <h2 className="font-semibold text-navy-900 mb-4">Ciclos</h2>
              {historial.ciclos.length === 0 ? (
                <p className="text-sm text-slate-500">Todavía no hay ciclos.</p>
              ) : (
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
                      <th className="pb-3 font-semibold">Inicio</th>
                      <th className="pb-3 font-semibold">Fin</th>
                      <th className="pb-3 font-semibold">Estado</th>
                      <th className="pb-3 font-semibold">Nutricionista</th>
                      <th className="pb-3 font-semibold">Veredicto</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {[...historial.ciclos].reverse().map((ciclo) => (
                      <tr key={ciclo.id} className="border-b border-slate-100">
                        <td className="py-3 text-slate-600">{formatearFecha(ciclo.fechaInicio)}</td>
                        <td className="py-3 text-slate-600">{formatearFecha(ciclo.fechaFin)}</td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold ${
                              CICLOS_EN_CURSO.includes(ciclo.estado) ? 'bg-accent/15 text-accent' : 'bg-navy-700/10 text-navy-700'
                            }`}
                          >
                            {ESTADOS_CICLO[ciclo.estado] ?? ciclo.estado}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600">{ciclo.nutricionista?.nombre ?? '—'}</td>
                        <td className="py-3 text-slate-600">{ciclo.veredicto ? (EVALUACIONES[ciclo.veredicto.evaluacion] ?? ciclo.veredicto.evaluacion) : '—'}</td>
                        <td className="py-3 text-right">{ciclo.estado === 'evaluado' && <BotonPdf ciclo={ciclo} />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </Estado>
    </>
  )
}
