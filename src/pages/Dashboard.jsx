import { useEffect, useState } from 'react'
import { Users, RefreshCw, Handshake, UtensilsCrossed } from 'lucide-react'
import StatCard from '../components/StatCard'
import BarChart from '../components/BarChart'
import Estado from '../components/Estado'
import { obtenerResumen } from '../api/dashboard'

const OBJETIVOS = {
  perder_peso: 'Pérdida de peso',
  ganar_masa_muscular: 'Ganancia muscular',
  mantener_peso: 'Mantener peso',
  mejorar_salud: 'Mejorar salud',
}

const ESTADOS = {
  en_registro: 'En registro',
  enviado: 'Enviado',
  evaluado: 'Evaluado',
  vencido: 'Vencido',
  cancelado: 'Cancelado',
}

const ESTADOS_ACTIVOS = ['en_registro', 'enviado']

function formatearFecha(iso) {
  return new Date(iso)
    .toLocaleDateString('es-EC', { day: 'numeric', month: 'short', timeZone: 'UTC' })
    .replace('.', '')
}

export default function Dashboard() {
  const [estado, setEstado] = useState({ cargando: true, error: null, resumen: null })

  useEffect(() => {
    let activo = true
    obtenerResumen()
      .then((resumen) => {
        if (activo) setEstado({ cargando: false, error: null, resumen })
      })
      .catch((err) => {
        if (activo) setEstado({ cargando: false, error: err.message, resumen: null })
      })
    return () => {
      activo = false
    }
  }, [])

  const { resumen } = estado
  const tarjetas = resumen
    ? [
        { titulo: 'Clientes', valor: resumen.tarjetas.clientes, icono: Users, destacada: true },
        { titulo: 'Ciclos en curso', valor: resumen.tarjetas.ciclosEnCurso, icono: RefreshCw },
        { titulo: 'Alianzas activas', valor: resumen.tarjetas.alianzasActivas, icono: Handshake },
        { titulo: 'Registros de comida', valor: resumen.tarjetas.registrosComida, icono: UtensilsCrossed },
      ]
    : []

  return (
    <>
      <h1 className="text-2xl text-navy-900 mb-6">Panel de FitBalance</h1>

      <Estado cargando={estado.cargando} error={estado.error}>
        {resumen && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {tarjetas.map((tarjeta) => (
                <StatCard key={tarjeta.titulo} {...tarjeta} valor={tarjeta.valor ?? 0} />
              ))}
            </div>

            <div className="mt-6">
              <BarChart
                meses={resumen.grafico.meses}
                anioActual={resumen.grafico.anioActual}
                anioAnterior={resumen.grafico.anioAnterior}
              />
            </div>

            <div className="mt-6 bg-white p-6 shadow-lg">
              <h2 className="font-semibold text-navy-900 mb-5">Ciclos recientes</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
                      <th className="pb-3 font-semibold">Cliente</th>
                      <th className="pb-3 font-semibold">Objetivo</th>
                      <th className="pb-3 font-semibold">Inicio</th>
                      <th className="pb-3 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.ciclosRecientes.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-3 text-slate-500">
                          No hay ciclos recientes.
                        </td>
                      </tr>
                    )}
                    {resumen.ciclosRecientes.map((ciclo) => (
                      <tr key={ciclo.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 font-semibold text-navy-900">{ciclo.cliente ?? '—'}</td>
                        <td className="py-3 text-slate-600">{OBJETIVOS[ciclo.objetivo] ?? ciclo.objetivo ?? '—'}</td>
                        <td className="py-3 text-slate-600">{formatearFecha(ciclo.fechaInicio)}</td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold ${
                              ESTADOS_ACTIVOS.includes(ciclo.estado)
                                ? 'bg-accent/15 text-accent'
                                : 'bg-navy-700/10 text-navy-700'
                            }`}
                          >
                            {ESTADOS[ciclo.estado] ?? ciclo.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </Estado>
    </>
  )
}
