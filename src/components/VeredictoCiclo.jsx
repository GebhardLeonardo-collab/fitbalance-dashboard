import { EVALUACIONES } from '../utils/etiquetas'

const formatearFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '')

function Texto({ titulo, valor }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{titulo}</p>
      <p className="mt-1 text-sm text-navy-900 whitespace-pre-line">{valor || 'Sin comentarios.'}</p>
    </div>
  )
}

export default function VeredictoCiclo({ veredicto }) {
  return (
    <div className="bg-white p-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="font-semibold text-navy-900">Veredicto</h3>
        <span className="px-2.5 py-1 text-xs font-semibold bg-accent/15 text-accent">
          {EVALUACIONES[veredicto.evaluacion] ?? veredicto.evaluacion}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <Texto titulo="Observaciones" valor={veredicto.observaciones} />
        <Texto titulo="Sustituciones sugeridas" valor={veredicto.sustituciones} />
        {veredicto.fecha && <p className="text-xs text-slate-500">Emitido el {formatearFecha(veredicto.fecha)}</p>}
      </div>
    </div>
  )
}
