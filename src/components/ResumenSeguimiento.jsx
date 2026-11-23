import { OBJETIVOS } from '../utils/etiquetas'
import { calcularResumen } from '../utils/seguimiento'

export default function ResumenSeguimiento({ historial }) {
  const { objetivoActual, pesoActual, variacion } = calcularResumen(historial)
  const signo = variacion > 0 ? '+' : ''

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm bg-white p-6 shadow-lg">
      <div>
        <dt className="text-xs uppercase tracking-wide text-slate-400">Objetivo actual</dt>
        <dd className="text-navy-900 mt-1">{OBJETIVOS[objetivoActual] ?? '—'}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-slate-400">Peso actual</dt>
        <dd className="text-navy-900 mt-1">{pesoActual === null ? '—' : `${pesoActual} kg`}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-slate-400">Variación desde el primer registro</dt>
        <dd className="text-navy-900 mt-1">{variacion === null ? '—' : `${signo}${variacion} kg`}</dd>
      </div>
    </dl>
  )
}
