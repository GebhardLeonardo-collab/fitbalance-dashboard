import { useCallback, useEffect, useState } from 'react'
import Estado from '../components/Estado'
import ConfirmarAccion from '../components/ConfirmarAccion'
import { useSesion } from '../context/useSesion'
import { cambiarEstadoAlianza, listarAlianzas } from '../api/alianzas'

const ESTADOS = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
}

const CLASE_ESTADO = {
  aceptada: 'bg-accent/15 text-accent',
  cancelada: 'bg-slate-200 text-slate-600',
}

const ESTADOS_ACTUALES = ['aceptada', 'pendiente']
const MAXIMO_HISTORIAL = 5

const ACCIONES = {
  finalizada: {
    titulo: (nombre) => `¿Finalizar la alianza con ${nombre}?`,
    mensaje: 'Esta acción no se puede deshacer.',
    confirmar: 'Sí, finalizar',
    exito: 'La alianza fue finalizada.',
  },
  cancelada: {
    titulo: (nombre) => `¿Cancelar tu solicitud a ${nombre}?`,
    mensaje: 'Podrás solicitar a otro nutricionista después.',
    confirmar: 'Sí, cancelar',
    exito: 'Solicitud cancelada.',
  },
}

const formatearFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '')

const estiloBoton =
  'border border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white text-xs font-semibold px-3 py-1.5 transition-colors'

export default function Alianzas() {
  const { usuario } = useSesion()
  const [estado, setEstado] = useState({ cargando: true, error: null, datos: [] })
  const [confirmacion, setConfirmacion] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [verTodo, setVerTodo] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const cargar = useCallback(
    () =>
      listarAlianzas()
        .then((datos) => setEstado({ cargando: false, error: null, datos }))
        .catch((err) => setEstado({ cargando: false, error: err.message, datos: [] })),
    [],
  )

  useEffect(() => {
    cargar()
  }, [cargar])

  async function confirmar() {
    const { alianza, accion } = confirmacion
    setEnviando(true)
    setMensaje(null)
    try {
      await cambiarEstadoAlianza(alianza.id, accion)
      setMensaje({ tipo: 'exito', texto: ACCIONES[accion].exito })
      await cargar()
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    } finally {
      setEnviando(false)
      setConfirmacion(null)
    }
  }

  const esGym = usuario.rol === 'gym'
  const contraparte = (alianza) =>
    (esGym ? alianza.nutricionista?.usuario?.nombre : alianza.gimnasio?.nombre) ?? '—'

  const actuales = estado.datos.filter((alianza) => ESTADOS_ACTUALES.includes(alianza.estado))
  const historial = estado.datos
    .filter((alianza) => !ESTADOS_ACTUALES.includes(alianza.estado))
    .sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud))
  const historialVisible = verTodo ? historial : historial.slice(0, MAXIMO_HISTORIAL)

  const encabezado = (conAcciones) => (
    <thead>
      <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
        <th className="pb-3 font-semibold">{esGym ? 'Nutricionista' : 'Gimnasio'}</th>
        <th className="pb-3 font-semibold">Solicitada</th>
        <th className="pb-3 font-semibold">Estado</th>
        {conAcciones && <th className="pb-3" />}
      </tr>
    </thead>
  )

  const fila = (alianza, conAcciones) => (
    <tr key={alianza.id} className="border-b border-slate-100">
      <td className="py-3">
        <p className={`font-semibold ${conAcciones ? 'text-navy-900' : 'text-slate-600'}`}>{contraparte(alianza)}</p>
        <p className="text-xs text-slate-500">{esGym ? alianza.nutricionista?.especialidad : alianza.gimnasio?.ciudad}</p>
      </td>
      <td className="py-3 text-slate-600">{formatearFecha(alianza.fechaSolicitud)}</td>
      <td className="py-3">
        <span className={`px-2.5 py-1 text-xs font-semibold ${CLASE_ESTADO[alianza.estado] ?? 'bg-navy-700/10 text-navy-700'}`}>
          {ESTADOS[alianza.estado] ?? alianza.estado}
        </span>
      </td>
      {conAcciones && (
        <td className="py-3 text-right">
          {alianza.estado === 'aceptada' && (
            <button type="button" onClick={() => setConfirmacion({ alianza, accion: 'finalizada' })} className={estiloBoton}>
              Finalizar
            </button>
          )}
          {esGym && alianza.estado === 'pendiente' && (
            <button type="button" onClick={() => setConfirmacion({ alianza, accion: 'cancelada' })} className={estiloBoton}>
              Cancelar solicitud
            </button>
          )}
        </td>
      )}
    </tr>
  )

  return (
    <>
      <h1 className="text-2xl text-navy-900 mb-6">Mis alianzas</h1>

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
        textoVacio={
          esGym ? 'Todavía no tienes alianzas. Solicita una desde el directorio de nutricionistas.' : 'Todavía no tienes alianzas.'
        }
      >
        <h2 className="font-semibold text-navy-900 mb-3">Actual</h2>
        {actuales.length === 0 ? (
          <div className="bg-white p-6 shadow-lg text-sm text-slate-500">No tienes una alianza ni solicitudes pendientes.</div>
        ) : (
          <div className="bg-white p-6 shadow-lg overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              {encabezado(true)}
              <tbody>{actuales.map((alianza) => fila(alianza, true))}</tbody>
            </table>
          </div>
        )}

        {historial.length > 0 && (
          <>
            <h2 className="font-semibold text-slate-500 mt-8 mb-3">Historial</h2>
            <div className="border border-slate-200 p-4 overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                {encabezado(false)}
                <tbody>{historialVisible.map((alianza) => fila(alianza, false))}</tbody>
              </table>
              {historial.length > MAXIMO_HISTORIAL && (
                <button
                  type="button"
                  onClick={() => setVerTodo((actual) => !actual)}
                  className="mt-4 text-xs font-semibold text-navy-700 hover:text-accent transition-colors"
                >
                  {verTodo ? 'Ver menos' : 'Ver todo el historial'}
                </button>
              )}
            </div>
          </>
        )}
      </Estado>

      {confirmacion && (
        <ConfirmarAccion
          titulo={ACCIONES[confirmacion.accion].titulo(contraparte(confirmacion.alianza))}
          mensaje={ACCIONES[confirmacion.accion].mensaje}
          textoConfirmar={ACCIONES[confirmacion.accion].confirmar}
          advertencia
          enviando={enviando}
          onConfirmar={confirmar}
          onCerrar={() => setConfirmacion(null)}
        />
      )}
    </>
  )
}
