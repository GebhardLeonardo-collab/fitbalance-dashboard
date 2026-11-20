import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Ban, ClipboardCheck, RefreshCw, Send, UserX, Users } from 'lucide-react'
import Estado from '../components/Estado'
import StatCard from '../components/StatCard'
import { listarClientes } from '../api/clientes'
import { resumirClientes } from '../utils/resumenClientes'

export default function InicioNutricionista() {
  const [estado, setEstado] = useState({ cargando: true, error: null, clientes: [] })

  useEffect(() => {
    let activo = true
    listarClientes()
      .then((clientes) => {
        if (activo) setEstado({ cargando: false, error: null, clientes })
      })
      .catch((err) => {
        if (activo) setEstado({ cargando: false, error: err.message, clientes: [] })
      })
    return () => {
      activo = false
    }
  }, [])

  const resumen = resumirClientes(estado.clientes)
  const esperando = estado.clientes.filter((cliente) => cliente.cicloActual?.estado === 'enviado')
  const tarjetas = [
    { titulo: 'Clientes', valor: resumen.total, icono: Users },
    { titulo: 'Ciclo en registro', valor: resumen.en_registro, icono: RefreshCw },
    { titulo: 'Ciclo evaluado', valor: resumen.evaluado, icono: ClipboardCheck },
    { titulo: 'Sin ciclo', valor: resumen.sinCiclo, icono: UserX },
    { titulo: 'Vencidos o cancelados', valor: resumen.cerrados, icono: Ban },
  ]

  return (
    <>
      <h1 className="text-2xl text-navy-900 mb-6">Inicio</h1>

      <Estado
        cargando={estado.cargando}
        error={estado.error}
        vacio={estado.clientes.length === 0}
        textoVacio="Todavía no hay clientes en los gimnasios con los que tienes una alianza aceptada."
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <StatCard titulo="Esperan tu veredicto" valor={esperando.length} icono={Send} destacada />

          <div className="lg:col-span-2 bg-white p-5 shadow-lg">
            <h2 className="font-semibold text-navy-900 mb-3">Clientes con el ciclo enviado</h2>
            {esperando.length === 0 ? (
              <p className="text-sm text-slate-500">No tienes ciclos esperando veredicto.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {esperando.map((cliente) => (
                  <li key={cliente.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy-900">{cliente.usuario?.nombre ?? 'Cliente'}</p>
                      <p className="text-xs text-slate-500">
                        {cliente.gimnasio?.nombre} · Ciclo {cliente.cicloActual.numero}
                      </p>
                    </div>
                    <Link
                      to={`/mis-clientes/${cliente.id}`}
                      className="border border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white text-xs font-semibold px-3 py-1.5 transition-colors"
                    >
                      Ver detalle
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tarjetas.map((tarjeta) => (
            <StatCard key={tarjeta.titulo} {...tarjeta} />
          ))}
        </div>
      </Estado>
    </>
  )
}
