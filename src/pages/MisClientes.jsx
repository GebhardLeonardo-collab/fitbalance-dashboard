import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Estado from '../components/Estado'
import BuscadorClientes from '../components/BuscadorClientes'
import { filtrarClientes } from '../utils/busqueda'
import { listarClientes } from '../api/clientes'
import { CICLOS_EN_CURSO, ESTADOS_CICLO } from '../utils/etiquetas'

export default function MisClientes() {
  const [estado, setEstado] = useState({ cargando: true, error: null, datos: [] })
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    let activo = true
    listarClientes()
      .then((datos) => {
        if (activo) setEstado({ cargando: false, error: null, datos })
      })
      .catch((err) => {
        if (activo) setEstado({ cargando: false, error: err.message, datos: [] })
      })
    return () => {
      activo = false
    }
  }, [])

  const visibles = filtrarClientes(estado.datos, busqueda)

  return (
    <>
      <h1 className="text-2xl text-navy-900 mb-6">Mis clientes</h1>

      {estado.datos.length > 0 && <BuscadorClientes valor={busqueda} onCambiar={setBusqueda} />}

      <Estado
        cargando={estado.cargando}
        error={estado.error}
        vacio={estado.datos.length === 0}
        textoVacio="Todavía no hay clientes en los gimnasios con los que tienes una alianza aceptada."
      >
        {visibles.length === 0 ? (
          <div className="bg-white p-6 shadow-lg text-sm text-slate-500">No se encontraron clientes</div>
        ) : (
        <div className="bg-white p-6 shadow-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[620px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
                <th className="pb-3 font-semibold">Cliente</th>
                <th className="pb-3 font-semibold">Gimnasio</th>
                <th className="pb-3 font-semibold">Ciclo actual</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {visibles.map((cliente) => {
                const ciclo = cliente.cicloActual
                return (
                  <tr key={cliente.id} className="border-b border-slate-100">
                    <td className="py-3">
                      <p className="font-semibold text-navy-900">{cliente.usuario?.nombre ?? '—'}</p>
                      <p className="text-xs text-slate-500">{cliente.usuario?.email}</p>
                    </td>
                    <td className="py-3 text-slate-600">{cliente.gimnasio?.nombre ?? '—'}</td>
                    <td className="py-3">
                      {ciclo ? (
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold ${
                            CICLOS_EN_CURSO.includes(ciclo.estado) ? 'bg-accent/15 text-accent' : 'bg-navy-700/10 text-navy-700'
                          }`}
                        >
                          {ESTADOS_CICLO[ciclo.estado] ?? ciclo.estado}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Sin ciclo</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/mis-clientes/${cliente.id}`}
                        className="inline-block border border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white text-xs font-semibold px-3 py-1.5 transition-colors"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        )}
      </Estado>
    </>
  )
}
