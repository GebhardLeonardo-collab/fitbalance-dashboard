import Estado from './Estado'
import GraficaPeso from './GraficaPeso'
import LineaTiempo from './LineaTiempo'
import ResumenSeguimiento from './ResumenSeguimiento'
import { useHistorial } from '../utils/seguimiento'

export default function SeguimientoSoloLectura({ clienteId }) {
  const { cargando, error, estadoHttp, historial } = useHistorial(clienteId)
  const sinAcceso = estadoHttp === 403
  const soloCiclos = historial && historial.pesos.length === 0 && historial.ciclos.length > 0
  const vacio = historial && historial.pesos.length === 0 && historial.ciclos.length === 0

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-xl text-navy-900">Seguimiento</h2>
      <Estado cargando={cargando} error={sinAcceso ? null : error}>
        {sinAcceso && <div className="bg-white p-6 shadow-lg text-sm text-slate-500">Sin acceso al historial.</div>}
        {vacio && <div className="bg-white p-6 shadow-lg text-sm text-slate-500">Sin acceso al historial o sin registros todavía.</div>}
        {soloCiclos && (
          <>
            <p className="bg-white p-4 shadow-lg text-sm text-slate-600">Solo ves los ciclos que evaluaste.</p>
            <LineaTiempo historial={historial} />
          </>
        )}
        {historial && historial.pesos.length > 0 && (
          <>
            <ResumenSeguimiento historial={historial} />
            <GraficaPeso pesos={historial.pesos} cambiosObjetivo={historial.cambiosObjetivo} />
            <LineaTiempo historial={historial} />
          </>
        )}
      </Estado>
    </section>
  )
}
