import { useCallback, useEffect, useState } from 'react'
import { MapPin, Award, Send } from 'lucide-react'
import Estado from '../components/Estado'
import ConfirmarAccion from '../components/ConfirmarAccion'
import { useSesion } from '../context/useSesion'
import { buscarMiGimnasio, listarNutricionistas } from '../api/nutricionistas'
import { cambiarEstadoAlianza, listarAlianzas, solicitarAlianza } from '../api/alianzas'

const distintos = (lista, campo) =>
  [...new Set(lista.map((item) => item[campo]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))

const nombreDe = (nutricionista) => nutricionista?.usuario?.nombre ?? 'Nutricionista'

export default function Nutricionistas() {
  const { usuario } = useSesion()
  const [base, setBase] = useState({ cargando: true, error: null, gimnasio: null, alianzas: [], ciudades: [], especialidades: [] })
  const [filtros, setFiltros] = useState({ ciudad: '', especialidad: '' })
  const [lista, setLista] = useState({ cargando: true, error: null, datos: [] })
  const [enviandoId, setEnviandoId] = useState(null)
  const [aCancelar, setACancelar] = useState(null)
  const [cancelando, setCancelando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const cargarBase = useCallback(
    () =>
      Promise.all([buscarMiGimnasio(usuario.id), listarAlianzas(), listarNutricionistas()])
        .then(([gimnasio, alianzas, todos]) =>
          setBase({
            cargando: false,
            error: null,
            gimnasio,
            alianzas,
            ciudades: distintos(todos, 'ciudad'),
            especialidades: distintos(todos, 'especialidad'),
          }),
        )
        .catch((err) => setBase((actual) => ({ ...actual, cargando: false, error: err.message }))),
    [usuario.id],
  )

  useEffect(() => {
    cargarBase()
  }, [cargarBase])

  useEffect(() => {
    let activo = true
    listarNutricionistas(filtros)
      .then((datos) => {
        if (activo) setLista({ cargando: false, error: null, datos })
      })
      .catch((err) => {
        if (activo) setLista({ cargando: false, error: err.message, datos: [] })
      })
    return () => {
      activo = false
    }
  }, [filtros])

  function cambiarFiltro(campo, valor) {
    setLista((actual) => ({ ...actual, cargando: true }))
    setFiltros((actuales) => ({ ...actuales, [campo]: valor }))
  }

  async function solicitar(nutricionista) {
    setEnviandoId(nutricionista.id)
    setMensaje(null)
    try {
      await solicitarAlianza(base.gimnasio.id, nutricionista.id)
      setMensaje({ tipo: 'exito', texto: `Solicitud enviada a ${nombreDe(nutricionista)}.` })
      await cargarBase()
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    } finally {
      setEnviandoId(null)
    }
  }

  async function cancelar() {
    setCancelando(true)
    setMensaje(null)
    try {
      await cambiarEstadoAlianza(aCancelar.id, 'cancelada')
      setMensaje({ tipo: 'exito', texto: 'Solicitud cancelada.' })
      await cargarBase()
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    } finally {
      setCancelando(false)
      setACancelar(null)
    }
  }

  const aceptada = base.alianzas.find((alianza) => alianza.estado === 'aceptada')
  const pendiente = base.alianzas.find((alianza) => alianza.estado === 'pendiente')
  const bloqueo = !base.gimnasio
    ? 'Tu usuario no tiene un perfil de gimnasio; pide a un administrador que lo cree para poder solicitar alianzas.'
    : aceptada
      ? `Ya tienes una alianza aceptada con ${nombreDe(aceptada.nutricionista)}. Finalízala en "Mis alianzas" para solicitar otra.`
      : pendiente
        ? `Tienes una solicitud pendiente con ${nombreDe(pendiente.nutricionista)}. Espera su respuesta antes de solicitar otra.`
        : null

  const selector = 'border border-slate-300 bg-white px-3 py-2 text-sm text-navy-900 focus:outline-none focus:border-accent'

  return (
    <>
      <h1 className="text-2xl text-navy-900 mb-6">Directorio de nutricionistas</h1>

      <Estado cargando={base.cargando} error={base.error}>
        {bloqueo && <p className="mb-4 bg-accent/15 text-navy-900 text-sm px-4 py-3">{bloqueo}</p>}
        {mensaje && (
          <p
            className={`mb-4 text-sm px-4 py-3 ${
              mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
            }`}
          >
            {mensaje.texto}
          </p>
        )}

        <div className="bg-white p-4 shadow-lg mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-navy-900">
            Ciudad
            <select value={filtros.ciudad} onChange={(e) => cambiarFiltro('ciudad', e.target.value)} className={selector}>
              <option value="">Todas</option>
              {base.ciudades.map((ciudad) => (
                <option key={ciudad} value={ciudad}>
                  {ciudad}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-navy-900">
            Especialidad
            <select
              value={filtros.especialidad}
              onChange={(e) => cambiarFiltro('especialidad', e.target.value)}
              className={selector}
            >
              <option value="">Todas</option>
              {base.especialidades.map((especialidad) => (
                <option key={especialidad} value={especialidad}>
                  {especialidad}
                </option>
              ))}
            </select>
          </label>
        </div>

        <Estado
          cargando={lista.cargando}
          error={lista.error}
          vacio={lista.datos.length === 0}
          textoVacio="No hay nutricionistas que coincidan con los filtros."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {lista.datos.map((nutricionista) => {
              const relacion = base.alianzas.find(
                (alianza) => alianza.nutricionistaId === nutricionista.id && ['pendiente', 'aceptada'].includes(alianza.estado),
              )
              return (
                <article key={nutricionista.id} className="bg-white p-5 shadow-lg flex flex-col">
                  <h2 className="font-semibold text-navy-900 text-lg">{nombreDe(nutricionista)}</h2>
                  <p className="text-sm text-slate-600 mt-1">{nutricionista.especialidad ?? 'Sin especialidad registrada'}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={15} className="text-accent" />
                      {nutricionista.ciudad}
                    </span>
                    {nutricionista.aniosExperiencia != null && (
                      <span className="flex items-center gap-1">
                        <Award size={15} className="text-accent" />
                        {nutricionista.aniosExperiencia} año{nutricionista.aniosExperiencia === 1 ? '' : 's'} de experiencia
                      </span>
                    )}
                  </div>
                  {nutricionista.descripcion && <p className="text-sm text-slate-600 mt-3">{nutricionista.descripcion}</p>}

                  <div className="mt-auto pt-5">
                    {relacion ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-block px-3 py-1.5 text-xs font-semibold bg-navy-700/10 text-navy-700">
                          {relacion.estado === 'aceptada' ? 'Alianza activa' : 'Solicitud pendiente'}
                        </span>
                        {relacion.estado === 'pendiente' && (
                          <button
                            type="button"
                            disabled={enviandoId !== null}
                            onClick={() => setACancelar({ id: relacion.id, nombre: nombreDe(nutricionista) })}
                            className="border border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white disabled:opacity-50 text-xs font-semibold px-3 py-1.5 transition-colors"
                          >
                            Cancelar solicitud
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={Boolean(bloqueo) || enviandoId !== null}
                        title={bloqueo ?? undefined}
                        onClick={() => solicitar(nutricionista)}
                        className="flex items-center gap-2 bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 transition-colors"
                      >
                        <Send size={15} />
                        {enviandoId === nutricionista.id ? 'Enviando...' : 'Solicitar alianza'}
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </Estado>
      </Estado>

      {aCancelar && (
        <ConfirmarAccion
          titulo={`¿Cancelar tu solicitud a ${aCancelar.nombre}?`}
          mensaje="Podrás solicitar a otro nutricionista después."
          textoConfirmar="Sí, cancelar"
          advertencia
          enviando={cancelando}
          onConfirmar={cancelar}
          onCerrar={() => setACancelar(null)}
        />
      )}
    </>
  )
}
