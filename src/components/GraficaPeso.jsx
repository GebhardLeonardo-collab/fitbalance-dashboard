import { formatearFecha } from '../utils/seguimiento'
import { OBJETIVOS } from '../utils/etiquetas'

const ANCHO = 640
const ALTO = 260
const MARGEN = { arriba: 16, derecha: 20, abajo: 36, izquierda: 48 }
const DIVISIONES = 4

export default function GraficaPeso({ pesos = [], cambiosObjetivo = [] }) {
  if (pesos.length === 0) return null

  const tiempos = pesos.map((p) => new Date(p.fecha).getTime())
  const inicio = Math.min(...tiempos)
  const fin = Math.max(...tiempos)
  const valores = pesos.map((p) => p.pesoKg)
  let minimo = Math.floor(Math.min(...valores) - 1)
  let maximo = Math.ceil(Math.max(...valores) + 1)
  if (maximo - minimo < DIVISIONES) {
    minimo -= 1
    maximo += 1
  }

  const anchoUtil = ANCHO - MARGEN.izquierda - MARGEN.derecha
  const altoUtil = ALTO - MARGEN.arriba - MARGEN.abajo
  const x = (tiempo) => MARGEN.izquierda + (fin === inicio ? anchoUtil / 2 : ((tiempo - inicio) / (fin - inicio)) * anchoUtil)
  const y = (valor) => MARGEN.arriba + (1 - (valor - minimo) / (maximo - minimo)) * altoUtil

  const puntos = pesos.map((p, i) => ({ ...p, cx: x(tiempos[i]), cy: y(p.pesoKg) }))
  const linea = puntos.map((p) => `${p.cx},${p.cy}`).join(' ')
  const marcasY = Array.from({ length: DIVISIONES + 1 }, (_, i) => minimo + ((maximo - minimo) * i) / DIVISIONES)
  const marcasX = fin === inicio ? [inicio] : [inicio, inicio + (fin - inicio) / 2, fin]
  const cambios = cambiosObjetivo.map((c) => ({
    ...c,
    cx: x(Math.min(Math.max(new Date(c.fecha).getTime(), inicio), fin)),
  }))

  return (
    <div className="bg-white p-6 shadow-lg">
      <h2 className="font-semibold text-navy-900 mb-4">Evolución del peso</h2>
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="w-full h-auto" role="img" aria-label="Gráfica de peso en kilogramos por fecha">
        {marcasY.map((valor) => (
          <g key={valor}>
            <line x1={MARGEN.izquierda} x2={ANCHO - MARGEN.derecha} y1={y(valor)} y2={y(valor)} className="stroke-slate-200" />
            <text x={MARGEN.izquierda - 8} y={y(valor) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
              {Number.isInteger(valor) ? valor : valor.toFixed(1)}
            </text>
          </g>
        ))}
        <text x={12} y={MARGEN.arriba - 4} className="fill-slate-400 text-[11px]">kg</text>

        {marcasX.map((tiempo, i) => (
          <text
            key={tiempo}
            x={x(tiempo)}
            y={ALTO - 10}
            textAnchor={marcasX.length === 1 ? 'middle' : i === 0 ? 'start' : i === marcasX.length - 1 ? 'end' : 'middle'}
            className="fill-slate-400 text-[11px]"
          >
            {formatearFecha(new Date(tiempo))}
          </text>
        ))}

        {cambios.map((c, i) => (
          <g key={`${c.fecha}-${i}`}>
            <title>{`${formatearFecha(c.fecha)}: objetivo de ${OBJETIVOS[c.objetivoAnterior] ?? 'sin definir'} a ${OBJETIVOS[c.objetivoNuevo] ?? c.objetivoNuevo}`}</title>
            <line x1={c.cx} x2={c.cx} y1={MARGEN.arriba} y2={ALTO - MARGEN.abajo} strokeDasharray="4 3" className="stroke-accent" />
            <polygon points={`${c.cx - 5},${MARGEN.arriba} ${c.cx + 5},${MARGEN.arriba} ${c.cx},${MARGEN.arriba + 8}`} className="fill-accent" />
          </g>
        ))}

        {puntos.length > 1 && <polyline points={linea} fill="none" strokeWidth="2" className="stroke-navy-700" />}
        {puntos.map((p, i) => (
          <circle key={`${p.fecha}-${i}`} cx={p.cx} cy={p.cy} r="4.5" className="fill-navy-700 stroke-white" strokeWidth="1.5">
            <title>{`${formatearFecha(p.fecha)}: ${p.pesoKg} kg`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex flex-wrap gap-5 mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-navy-700" />Peso registrado</span>
        {cambiosObjetivo.length > 0 && (
          <span className="flex items-center gap-2"><span className="w-4 border-t-2 border-dashed border-accent" />Cambio de objetivo</span>
        )}
      </div>
    </div>
  )
}
