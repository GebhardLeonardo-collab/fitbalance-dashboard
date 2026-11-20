import { useEffect, useState } from 'react'
import { Ban, ClipboardCheck, RefreshCw, Send, UserX, Users } from 'lucide-react'
import Estado from '../components/Estado'
import StatCard from '../components/StatCard'
import { listarClientes } from '../api/clientes'
import { resumirClientes } from '../utils/resumenClientes'

export default function InicioGimnasio() {
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
  const tarjetas = [
    { titulo: 'Clientes', valor: resumen.total, icono: Users, destacada: true },
    { titulo: 'Ciclo en registro', valor: resumen.en_registro, icono: RefreshCw },
    { titulo: 'Ciclo enviado', valor: resumen.enviado, icono: Send },
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
        textoVacio="Todavía no tienes clientes. Da de alta al primero desde Clientes."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tarjetas.map((tarjeta) => (
            <StatCard key={tarjeta.titulo} {...tarjeta} />
          ))}
        </div>
      </Estado>
    </>
  )
}
