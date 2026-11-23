import { useEffect, useState } from 'react'
import Estado from '../components/Estado'
import ConfirmarAccion from '../components/ConfirmarAccion'
import MotivoRechazo from '../components/MotivoRechazo'
import { aprobarCuenta, listarSolicitudesCuenta, rechazarCuenta } from '../api/cuentas'

const ESTADOS = [
  { valor: 'pendiente', etiqueta: 'Pendientes', plural: 'pendientes' },
  { valor: 'aprobado', etiqueta: 'Aprobadas', plural: 'aprobadas' },
  { valor: 'rechazado', etiqueta: 'Rechazadas', plural: 'rechazadas' },
]

const ROLES = [
  { valor: '', etiqueta: 'Todos' },
  { valor: 'gym', etiqueta: 'Gimnasio' },
  { valor: 'nutricionista', etiqueta: 'Nutricionista' },
]

const NOMBRE_ROL = { gym: 'Gimnasio', nutricionista: 'Nutricionista' }
const ETIQUETA_ESTADO = { pendiente: 'Pendiente', aprobado: 'Aprobada', rechazado: 'Rechazada' }
const CLASE_ESTADO = {
  pendiente: 'bg-accent/15 text-accent',
  aprobado: 'bg-navy-700/10 text-navy-700',
  rechazado: 'bg-red-50 text-red-700',
}

const formatearFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '')

const nombreDe = (solicitud) => solicitud.usuario?.nombre ?? solicitud.nombre ?? '—'

const estiloBoton =
  'border border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white text-xs font-semibold px-3 py-1.5 transition-colors'
const estiloBotonRechazo =
  'border border-red-600 text-red-700 hover:bg-red-600 hover:text-white text-xs font-semibold px-3 py-1.5 transition-colors'

function Segmentos({ opciones, valor, onCambiar, etiqueta }) {
  return (
    <div role="group" aria-label={etiqueta} className="flex border border-slate-200 bg-white">
      {opciones.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          aria-pressed={valor === opcion.valor}
          onClick={() => onCambiar(opcion.valor)}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            valor === opcion.valor ? 'bg-navy-800 text-white' : 'text-navy-900 hover:bg-slate-50'
          }`}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  )
}

function Dato({ etiqueta, valor }) {
  if (valor == null || valor === '') return null
  return (
    <p className="text-xs text-slate-500">
      {etiqueta}: <span className="text-slate-700">{valor}</span>
    </p>
  )
}

export default function AprobacionCuentas() {
  const [filtroEstado, setFiltroEstado] = useState('pendiente')
  const [filtroRol, setFiltroRol] = useState('')
  const [version, setVersion] = useState(0)
  const [estado, setEstado] = useState({ cargando: true, error: null, datos: [] })
  const [aAprobar, setAAprobar] = useState(null)
  const [aRechazar, setARechazar] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    let activo = true
    listarSolicitudesCuenta({ estado: filtroEstado, rol: filtroRol })
      .then((datos) => {
        if (activo) setEstado({ cargando: false, error: null, datos })
      })
      .catch((err) => {
        if (activo) setEstado({ cargando: false, error: err.message, datos: [] })
      })
    return () => {
      activo = false
    }
  }, [filtroEstado, filtroRol, version])

  function cambiarFiltro(poner) {
    return (valor) => {
      setEstado((actual) => ({ ...actual, cargando: true }))
      poner(valor)
    }
  }

  async function ejecutar(accion, solicitud, exito) {
    setEnviando(true)
    setMensaje(null)
    try {
      await accion()
      setMensaje({ tipo: 'exito', texto: exito(nombreDe(solicitud)) })
      setEstado((actual) => ({ ...actual, cargando: true }))
      setVersion((actual) => actual + 1)
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    } finally {
      setEnviando(false)
      setAAprobar(null)
      setARechazar(null)
    }
  }

  const aprobar = () => ejecutar(() => aprobarCuenta(aAprobar.usuarioId), aAprobar, (nombre) => `La cuenta de ${nombre} fue aprobada.`)
  const rechazar = (motivo) =>
    ejecutar(() => rechazarCuenta(aRechazar.usuarioId, motivo), aRechazar, (nombre) => `La solicitud de ${nombre} fue rechazada.`)

  const plural = ESTADOS.find((e) => e.valor === filtroEstado).plural
  const textoVacio = `No hay solicitudes ${plural}${filtroRol ? ` de ${NOMBRE_ROL[filtroRol].toLowerCase()}` : ''}.`

  return (
    <>
      <h1 className="text-2xl text-navy-900 mb-6">Aprobación de cuentas</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <Segmentos
          etiqueta="Estado"
          opciones={ESTADOS.map(({ valor, etiqueta }) => ({ valor, etiqueta }))}
          valor={filtroEstado}
          onCambiar={cambiarFiltro(setFiltroEstado)}
        />
        <Segmentos etiqueta="Rol" opciones={ROLES} valor={filtroRol} onCambiar={cambiarFiltro(setFiltroRol)} />
      </div>

      {mensaje && (
        <p
          className={`mb-4 text-sm px-4 py-3 ${
            mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      <Estado cargando={estado.cargando} error={estado.error} vacio={estado.datos.length === 0} textoVacio={textoVacio}>
        <div className="bg-white p-6 shadow-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
                <th className="pb-3 font-semibold">Solicitante</th>
                <th className="pb-3 font-semibold">Contacto</th>
                <th className="pb-3 font-semibold">Datos del perfil</th>
                <th className="pb-3 font-semibold">Registro</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {estado.datos.map((solicitud) => (
                <tr key={solicitud.id} className="border-b border-slate-100 align-top">
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-navy-900">{nombreDe(solicitud)}</p>
                    <p className="text-xs text-slate-500 break-all">{solicitud.usuario?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-navy-700/10 text-navy-700">
                      {NOMBRE_ROL[solicitud.rol] ?? solicitud.rol}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <Dato etiqueta="Ciudad" valor={solicitud.ciudad} />
                    <Dato etiqueta="Teléfono" valor={solicitud.telefono} />
                    <Dato etiqueta="Dirección" valor={solicitud.direccion} />
                  </td>
                  <td className="py-3 pr-4">
                    <Dato etiqueta="Responsable" valor={solicitud.responsable} />
                    <Dato etiqueta="Cédula" valor={solicitud.cedula} />
                    <Dato etiqueta="Especialidad" valor={solicitud.especialidad} />
                    <Dato etiqueta="Años de experiencia" valor={solicitud.aniosExperiencia} />
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-xs text-slate-500 mb-1">{formatearFecha(solicitud.createdAt)}</p>
                    <span className={`px-2.5 py-1 text-xs font-semibold ${CLASE_ESTADO[solicitud.estadoAprobacion] ?? 'bg-navy-700/10 text-navy-700'}`}>
                      {ETIQUETA_ESTADO[solicitud.estadoAprobacion] ?? solicitud.estadoAprobacion}
                    </span>
                    {solicitud.motivoRechazo && (
                      <p className="text-xs text-slate-500 mt-2 max-w-[220px]">Motivo: {solicitud.motivoRechazo}</p>
                    )}
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    {solicitud.estadoAprobacion !== 'aprobado' && (
                      <button type="button" onClick={() => setAAprobar(solicitud)} className={estiloBoton}>
                        Aprobar
                      </button>
                    )}
                    {solicitud.estadoAprobacion === 'pendiente' && (
                      <button type="button" onClick={() => setARechazar(solicitud)} className={`${estiloBotonRechazo} ml-2`}>
                        Rechazar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Estado>

      {aAprobar && (
        <ConfirmarAccion
          titulo={`¿Aprobar la cuenta de ${nombreDe(aAprobar)}?`}
          mensaje="Podrá iniciar sesión y usar FitBalance desde este momento."
          textoConfirmar="Sí, aprobar"
          enviando={enviando}
          onConfirmar={aprobar}
          onCerrar={() => setAAprobar(null)}
        />
      )}

      {aRechazar && (
        <MotivoRechazo nombre={nombreDe(aRechazar)} enviando={enviando} onConfirmar={rechazar} onCerrar={() => setARechazar(null)} />
      )}
    </>
  )
}
