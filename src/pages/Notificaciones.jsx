import { useCallback, useEffect, useState } from 'react'
import { CheckCheck } from 'lucide-react'
import Estado from '../components/Estado'
import {
  avisarCambioNotificaciones,
  listarNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
} from '../api/notificaciones'

const formatearFechaHora = (iso) =>
  new Date(iso).toLocaleString('es-EC', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).replace('.', '')

export default function Notificaciones() {
  const [estado, setEstado] = useState({ cargando: true, error: null, datos: [] })
  const [error, setError] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const cargar = useCallback(
    () =>
      listarNotificaciones()
        .then((datos) => setEstado({ cargando: false, error: null, datos }))
        .catch((err) => setEstado({ cargando: false, error: err.message, datos: [] })),
    [],
  )

  useEffect(() => {
    cargar()
  }, [cargar])

  async function actuar(accion) {
    setProcesando(true)
    setError(null)
    try {
      await accion()
      await cargar()
      avisarCambioNotificaciones()
    } catch (err) {
      setError(err.message)
    } finally {
      setProcesando(false)
    }
  }

  const sinLeer = estado.datos.filter((notificacion) => !notificacion.leida).length

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl text-navy-900">Notificaciones</h1>
        {sinLeer > 0 && (
          <button
            type="button"
            disabled={procesando}
            onClick={() => actuar(marcarTodasLeidas)}
            className="flex items-center gap-2 bg-accent hover:bg-accent-light disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 transition-colors"
          >
            <CheckCheck size={16} />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {error && <p className="mb-4 bg-red-50 text-red-700 text-sm px-4 py-3">{error}</p>}

      <Estado
        cargando={estado.cargando}
        error={estado.error}
        vacio={estado.datos.length === 0}
        textoVacio="No tienes notificaciones."
      >
        <ul className="bg-white shadow-lg divide-y divide-slate-100">
          {estado.datos.map((notificacion) => (
            <li
              key={notificacion.id}
              className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 ${notificacion.leida ? '' : 'bg-accent/10'}`}
            >
              <div className="min-w-0 flex-1">
                <p className={`text-sm text-navy-900 ${notificacion.leida ? '' : 'font-semibold'}`}>{notificacion.mensaje}</p>
                <p className="text-xs text-slate-500 mt-1">{formatearFechaHora(notificacion.createdAt)}</p>
              </div>
              {!notificacion.leida && (
                <button
                  type="button"
                  disabled={procesando}
                  onClick={() => actuar(() => marcarLeida(notificacion.id))}
                  className="border border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white disabled:opacity-50 text-xs font-semibold px-3 py-1.5 transition-colors"
                >
                  Marcar como leída
                </button>
              )}
            </li>
          ))}
        </ul>
      </Estado>
    </>
  )
}
