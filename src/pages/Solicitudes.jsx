import { useCallback, useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import Estado from '../components/Estado'
import ConfirmarAccion from '../components/ConfirmarAccion'
import { cambiarEstadoAlianza, listarAlianzas } from '../api/alianzas'

const ACCIONES = {
  aceptada: {
    titulo: (nombre) => `¿Aceptar la solicitud de ${nombre}?`,
    mensaje: 'Pasarás a ser el nutricionista aliado de este gimnasio.',
    confirmar: 'Sí, aceptar',
    verbo: 'aceptada',
    advertencia: false,
  },
  rechazada: {
    titulo: (nombre) => `¿Rechazar la solicitud de ${nombre}?`,
    mensaje: 'Esta acción no se puede deshacer.',
    confirmar: 'Sí, rechazar',
    verbo: 'rechazada',
    advertencia: true,
  },
}

const formatearFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '')

const nombreGimnasio = (alianza) => alianza.gimnasio?.nombre ?? 'el gimnasio'

export default function Solicitudes() {
  const [estado, setEstado] = useState({ cargando: true, error: null, datos: [] })
  const [confirmacion, setConfirmacion] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const cargar = useCallback(
    () =>
      listarAlianzas({ estado: 'pendiente' })
        .then((datos) => setEstado({ cargando: false, error: null, datos }))
        .catch((err) => setEstado({ cargando: false, error: err.message, datos: [] })),
    [],
  )

  useEffect(() => {
    cargar()
  }, [cargar])

  async function responder() {
    const { alianza, accion } = confirmacion
    setEnviando(true)
    setMensaje(null)
    try {
      await cambiarEstadoAlianza(alianza.id, accion)
      setMensaje({ tipo: 'exito', texto: `Solicitud de ${nombreGimnasio(alianza)} ${ACCIONES[accion].verbo}.` })
      await cargar()
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    } finally {
      setEnviando(false)
      setConfirmacion(null)
    }
  }

  return (
    <>
      <h1 className="text-2xl text-navy-900 mb-6">Solicitudes recibidas</h1>

      {mensaje && (
        <p
          className={`mb-4 text-sm px-4 py-3 ${
            mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      <Estado
        cargando={estado.cargando}
        error={estado.error}
        vacio={estado.datos.length === 0}
        textoVacio="No tienes solicitudes pendientes."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {estado.datos.map((alianza) => (
            <article key={alianza.id} className="bg-white p-5 shadow-lg flex flex-col">
              <h2 className="font-semibold text-navy-900 text-lg">{alianza.gimnasio?.nombre ?? 'Gimnasio'}</h2>
              <p className="text-sm text-slate-600 mt-1">{alianza.gimnasio?.ciudad}</p>
              <p className="text-xs text-slate-500 mt-3">Solicitada el {formatearFecha(alianza.fechaSolicitud)}</p>

              <div className="mt-auto pt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmacion({ alianza, accion: 'aceptada' })}
                  className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white text-sm font-semibold px-4 py-2 transition-colors"
                >
                  <Check size={15} />
                  Aceptar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmacion({ alianza, accion: 'rechazada' })}
                  className="flex items-center gap-2 border border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white text-sm font-semibold px-4 py-2 transition-colors"
                >
                  <X size={15} />
                  Rechazar
                </button>
              </div>
            </article>
          ))}
        </div>
      </Estado>

      {confirmacion && (
        <ConfirmarAccion
          titulo={ACCIONES[confirmacion.accion].titulo(nombreGimnasio(confirmacion.alianza))}
          mensaje={ACCIONES[confirmacion.accion].mensaje}
          textoConfirmar={ACCIONES[confirmacion.accion].confirmar}
          advertencia={ACCIONES[confirmacion.accion].advertencia}
          enviando={enviando}
          onConfirmar={responder}
          onCerrar={() => setConfirmacion(null)}
        />
      )}
    </>
  )
}
