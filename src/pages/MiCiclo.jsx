import { Fragment, useCallback, useEffect, useState } from 'react'
import { Camera } from 'lucide-react'
import Estado from '../components/Estado'
import ConfirmarAccion from '../components/ConfirmarAccion'
import FotoRegistro from '../components/FotoRegistro'
import RegistroFoto from '../components/RegistroFoto'
import { listarClientes } from '../api/clientes'
import { enviarCiclo } from '../api/ciclos'
import { listarRegistros } from '../api/registros'
import { CICLOS_EN_CURSO, ESTADOS_CICLO, TOTAL_REGISTROS, formatearDia } from '../utils/etiquetas'

const DIAS = [1, 2, 3]
const COMIDAS = [
  ['desayuno', 'Desayuno'],
  ['almuerzo', 'Almuerzo'],
  ['cena', 'Cena'],
]

const TEXTO_CERRADO = {
  vencido: 'Este ciclo venció porque se acabó el plazo de registro. Tu gimnasio puede abrir uno nuevo.',
  cancelado: 'Este ciclo fue cancelado por tu gimnasio.',
}

export default function MiCiclo() {
  const [estado, setEstado] = useState({ cargando: true, error: null, ciclo: null, registros: [] })
  const [abierta, setAbierta] = useState(null)
  const [confirmandoEnvio, setConfirmandoEnvio] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const cargar = useCallback(async (inicial = false) => {
    try {
      const ciclo = (await listarClientes())[0]?.cicloActual ?? null
      const registros = ciclo ? await listarRegistros(ciclo.id) : []
      setEstado({ cargando: false, error: null, ciclo, registros })
    } catch (err) {
      if (inicial) setEstado((actual) => ({ ...actual, cargando: false, error: err.message }))
      else setMensaje((actual) => actual ?? { tipo: 'error', texto: err.message })
    }
  }, [])

  useEffect(() => {
    cargar(true)
  }, [cargar])

  async function enviar() {
    setEnviando(true)
    setMensaje(null)
    try {
      await enviarCiclo(estado.ciclo.id)
      setMensaje({ tipo: 'exito', texto: 'Ciclo enviado. Tu nutricionista lo revisará.' })
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    } finally {
      setEnviando(false)
      setConfirmandoEnvio(false)
      cargar()
    }
  }

  const { ciclo, registros } = estado
  const confirmadas = registros.filter((registro) => registro.confirmado).length
  const faltan = TOTAL_REGISTROS - confirmadas
  const editable = ciclo?.estado === 'en_registro'
  const registroDe = (dia, tipoComida) => registros.find((registro) => registro.dia === dia && registro.tipoComida === tipoComida)
  const etiquetaDe = (tipoComida) => COMIDAS.find(([valor]) => valor === tipoComida)[1]

  return (
    <>
      <h1 className="text-2xl text-navy-900 mb-6">Mi ciclo</h1>

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
        vacio={!ciclo}
        textoVacio="Aún no tienes un ciclo abierto. Tu gimnasio lo abrirá."
      >
        {ciclo && (
          <>
            <div className="bg-white p-6 shadow-lg max-w-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h2 className="font-semibold text-navy-900 text-lg">Ciclo {ciclo.numero}</h2>
                <span
                  className={`px-2.5 py-1 text-xs font-semibold ${
                    CICLOS_EN_CURSO.includes(ciclo.estado) ? 'bg-accent/15 text-accent' : 'bg-navy-700/10 text-navy-700'
                  }`}
                >
                  {ESTADOS_CICLO[ciclo.estado] ?? ciclo.estado}
                </span>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Inicio</dt>
                  <dd className="text-navy-900 mt-1">{formatearDia(ciclo.fechaInicio)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Fecha límite de registro</dt>
                  <dd className="text-navy-900 mt-1">{formatearDia(ciclo.fechaLimiteRegistro)}</dd>
                </div>
              </dl>

              <div className="mt-6">
                <p className="text-sm text-navy-900 mb-2">
                  {confirmadas} de {TOTAL_REGISTROS} registros confirmados
                </p>
                <div className="h-2 bg-slate-200">
                  <div className="h-full bg-accent" style={{ width: `${(confirmadas / TOTAL_REGISTROS) * 100}%` }} />
                </div>
              </div>
            </div>

            {TEXTO_CERRADO[ciclo.estado] && <p className="mt-4 text-sm text-slate-600">{TEXTO_CERRADO[ciclo.estado]}</p>}

            <div className="mt-6 bg-white p-4 sm:p-6 shadow-lg overflow-x-auto">
              <div className="min-w-[480px] grid grid-cols-[5.5rem_repeat(3,minmax(0,1fr))] gap-3">
                <span />
                {DIAS.map((dia) => (
                  <p key={dia} className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                    Día {dia}
                  </p>
                ))}

                {COMIDAS.map(([tipoComida, etiqueta]) => (
                  <Fragment key={tipoComida}>
                    <p className="self-center text-sm font-semibold text-navy-900">{etiqueta}</p>
                    {DIAS.map((dia) => {
                      const registro = registroDe(dia, tipoComida)
                      if (!registro) {
                        return editable ? (
                          <button
                            key={dia}
                            type="button"
                            onClick={() => setAbierta({ dia, tipoComida })}
                            className="h-32 border border-dashed border-slate-300 hover:border-accent hover:text-accent text-slate-500 flex flex-col items-center justify-center gap-2 text-xs font-semibold transition-colors"
                          >
                            <Camera size={22} />
                            Subir foto
                          </button>
                        ) : (
                          <div key={dia} className="h-32 border border-slate-200 flex items-center justify-center text-xs text-slate-400">
                            Sin foto
                          </div>
                        )
                      }
                      return (
                        <button
                          key={dia}
                          type="button"
                          onClick={() => setAbierta({ dia, tipoComida })}
                          className="relative h-32 overflow-hidden border border-slate-200 hover:border-accent transition-colors"
                        >
                          <FotoRegistro registroId={registro.id} className="w-full h-full" />
                          <span
                            className={`absolute bottom-0 inset-x-0 py-1 text-[11px] font-semibold text-white ${
                              registro.confirmado ? 'bg-navy-800/90' : 'bg-accent/95'
                            }`}
                          >
                            {registro.confirmado ? 'Confirmada' : 'Por confirmar'}
                          </span>
                        </button>
                      )
                    })}
                  </Fragment>
                ))}
              </div>
            </div>

            {editable && (
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  disabled={faltan > 0}
                  onClick={() => setConfirmandoEnvio(true)}
                  className="bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 transition-colors"
                >
                  Enviar ciclo
                </button>
                {faltan > 0 && (
                  <p className="text-sm text-slate-600">
                    {faltan === 1 ? 'Te falta 1 foto por confirmar' : `Te faltan ${faltan} fotos por confirmar`}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </Estado>

      {abierta && (
        <RegistroFoto
          key={`${abierta.dia}-${abierta.tipoComida}`}
          titulo={`${etiquetaDe(abierta.tipoComida)} · Día ${abierta.dia}`}
          cicloId={ciclo.id}
          dia={abierta.dia}
          tipoComida={abierta.tipoComida}
          fechaInicio={ciclo.fechaInicio}
          registro={registroDe(abierta.dia, abierta.tipoComida)}
          editable={editable}
          onCambio={cargar}
          onCerrar={() => setAbierta(null)}
        />
      )}

      {confirmandoEnvio && (
        <ConfirmarAccion
          titulo="¿Enviar tu ciclo a revisión?"
          mensaje="Una vez enviado no podrás modificar tus fotos."
          textoConfirmar="Sí, enviar ciclo"
          enviando={enviando}
          onConfirmar={enviar}
          onCerrar={() => setConfirmandoEnvio(false)}
        />
      )}
    </>
  )
}
