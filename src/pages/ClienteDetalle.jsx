import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import Estado from '../components/Estado'
import RegistrosDelCiclo from '../components/RegistrosDelCiclo'
import FormularioVeredicto from '../components/FormularioVeredicto'
import VeredictoCiclo from '../components/VeredictoCiclo'
import SeguimientoSoloLectura from '../components/SeguimientoSoloLectura'
import { guardarPdfVeredicto } from '../utils/descargas'
import { cambiarFrecuencia, obtenerCliente } from '../api/clientes'
import { obtenerCiclo } from '../api/ciclos'
import { listarRegistros } from '../api/registros'
import { CICLOS_EN_CURSO, ESTADOS_CICLO, FRECUENCIAS, OBJETIVOS } from '../utils/etiquetas'

const REVISABLES = ['enviado', 'evaluado']

const TEXTO_SIN_REVISION = {
  en_registro: 'El cliente está registrando sus comidas. Podrás revisar el ciclo cuando lo envíe.',
  vencido: 'El último ciclo venció sin ser enviado.',
  cancelado: 'El último ciclo fue cancelado por el gimnasio.',
}

export default function ClienteDetalle() {
  const { id } = useParams()
  const [estado, setEstado] = useState({ cargando: true, error: null, cliente: null, ciclo: null, registros: [] })
  const [guardandoFrecuencia, setGuardandoFrecuencia] = useState(false)
  const [descargando, setDescargando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const cargar = useCallback(async () => {
    try {
      const cliente = await obtenerCliente(id)
      const actual = cliente.cicloActual
      const [ciclo, registros] = actual && REVISABLES.includes(actual.estado)
        ? await Promise.all([obtenerCiclo(actual.id), listarRegistros(actual.id)])
        : [null, []]
      setEstado({ cargando: false, error: null, cliente, ciclo, registros })
    } catch (err) {
      setEstado((anterior) => (anterior.cargando ? { ...anterior, cargando: false, error: err.message } : anterior))
      setMensaje((anterior) => anterior ?? { tipo: 'error', texto: err.message })
    }
  }, [id])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function elegirFrecuencia(evento) {
    const nueva = evento.target.value
    const anterior = estado.cliente.frecuenciaEvaluacion
    if (nueva === anterior) return
    setEstado((actual) => ({ ...actual, cliente: { ...actual.cliente, frecuenciaEvaluacion: nueva } }))
    setGuardandoFrecuencia(true)
    setMensaje(null)
    try {
      await cambiarFrecuencia(estado.cliente.id, nueva)
      setMensaje({ tipo: 'exito', texto: 'Frecuencia actualizada.' })
    } catch (err) {
      setEstado((actual) => ({ ...actual, cliente: { ...actual.cliente, frecuenciaEvaluacion: anterior } }))
      setMensaje({ tipo: 'error', texto: err.message })
    } finally {
      setGuardandoFrecuencia(false)
    }
  }

  async function descargarPdf() {
    setDescargando(true)
    setMensaje(null)
    try {
      await guardarPdfVeredicto(estado.ciclo.id, `veredicto-ciclo-${estado.ciclo.numero}.pdf`)
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    } finally {
      setDescargando(false)
    }
  }

  async function veredictoEmitido() {
    setMensaje({ tipo: 'exito', texto: 'Veredicto emitido.' })
    await cargar()
  }

  const { cliente, ciclo, registros } = estado
  const cicloActual = cliente?.cicloActual

  return (
    <>
      <Link to="/mis-clientes" className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-accent mb-4">
        <ArrowLeft size={16} />
        Mis clientes
      </Link>

      {mensaje && (
        <p
          className={`mb-4 text-sm px-4 py-3 ${
            mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      <Estado cargando={estado.cargando} error={estado.error}>
        {cliente && (
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 shadow-lg">
              <h1 className="text-2xl text-navy-900">{cliente.usuario?.nombre ?? 'Cliente'}</h1>
              <p className="text-sm text-slate-500">{cliente.usuario?.email}</p>

              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-5">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Gimnasio</dt>
                  <dd className="text-navy-900 mt-1">{cliente.gimnasio?.nombre ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Objetivo</dt>
                  <dd className="text-navy-900 mt-1">{OBJETIVOS[cliente.objetivo] ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Ciclo actual</dt>
                  <dd className="mt-1">
                    {cicloActual ? (
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold ${
                          CICLOS_EN_CURSO.includes(cicloActual.estado) ? 'bg-accent/15 text-accent' : 'bg-navy-700/10 text-navy-700'
                        }`}
                      >
                        #{cicloActual.numero} · {ESTADOS_CICLO[cicloActual.estado] ?? cicloActual.estado}
                      </span>
                    ) : (
                      <span className="text-slate-500">Sin ciclo</span>
                    )}
                  </dd>
                </div>
              </dl>

              <label className="flex flex-col gap-1 text-sm text-navy-900 mt-6 max-w-xs">
                Frecuencia de evaluación
                <select
                  value={cliente.frecuenciaEvaluacion}
                  disabled={guardandoFrecuencia}
                  onChange={elegirFrecuencia}
                  className="border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-accent disabled:opacity-60"
                >
                  {Object.entries(FRECUENCIAS).map(([valor, texto]) => (
                    <option key={valor} value={valor}>
                      {texto}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-500">
                  Define la duración de los próximos ciclos; los ciclos ya abiertos no cambian.
                </span>
              </label>
            </div>

            {!ciclo && (
              <div className="bg-white p-6 shadow-lg text-sm text-slate-500">
                {cicloActual ? TEXTO_SIN_REVISION[cicloActual.estado] : 'Este cliente todavía no tiene un ciclo.'}
              </div>
            )}

            {ciclo && (
              <>
                <RegistrosDelCiclo registros={registros} totalesPorDia={ciclo.totalesPorDia} />

                {ciclo.estado === 'enviado' && <FormularioVeredicto cicloId={ciclo.id} onEmitido={veredictoEmitido} />}

                {ciclo.estado === 'evaluado' && ciclo.veredicto && (
                  <>
                    <VeredictoCiclo veredicto={ciclo.veredicto} />
                    <div>
                      <button
                        type="button"
                        disabled={descargando}
                        onClick={descargarPdf}
                        className="flex items-center gap-2 bg-accent hover:bg-accent-light disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
                      >
                        <Download size={16} />
                        {descargando ? 'Descargando...' : 'Descargar PDF'}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            <SeguimientoSoloLectura clienteId={cliente.id} />
          </div>
        )}
      </Estado>
    </>
  )
}
