import { useEffect, useState } from 'react'
import Estado from '../components/Estado'
import GraficaPeso from '../components/GraficaPeso'
import LineaTiempo from '../components/LineaTiempo'
import ResumenSeguimiento from '../components/ResumenSeguimiento'
import { cambiarObjetivo, corregirUltimoPeso, listarClientes, registrarPeso } from '../api/clientes'
import { OBJETIVOS } from '../utils/etiquetas'
import { DIAS_ENTRE_REGISTROS, DIAS_PARA_CORREGIR, aDiaISO, diasEntre, formatearFecha, sumarDias, useHistorial } from '../utils/seguimiento'

const PESO_MINIMO = 30
const PESO_MAXIMO = 300

const campo = 'border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-accent w-40'

function pesoValido(texto) {
  const peso = Number(texto)
  return texto.trim() !== '' && peso >= PESO_MINIMO && peso <= PESO_MAXIMO ? peso : null
}

export default function MiProgreso() {
  const [perfil, setPerfil] = useState({ cargando: true, error: null, id: null })
  const { cargando, error, historial, recargar } = useHistorial(perfil.id)
  const [peso, setPeso] = useState('')
  const [pesoCorreccion, setPesoCorreccion] = useState('')
  const [corrigiendo, setCorrigiendo] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [disponibleServidor, setDisponibleServidor] = useState(null)
  const [editandoObjetivo, setEditandoObjetivo] = useState(false)
  const [objetivoElegido, setObjetivoElegido] = useState('')
  const [guardandoObjetivo, setGuardandoObjetivo] = useState(false)
  const [errorObjetivo, setErrorObjetivo] = useState(null)

  useEffect(() => {
    listarClientes()
      .then((lista) =>
        setPerfil(
          lista[0]
            ? { cargando: false, error: null, id: lista[0].id }
            : { cargando: false, error: 'No se encontró tu perfil de cliente.', id: null },
        ),
      )
      .catch((err) => setPerfil({ cargando: false, error: err.message, id: null }))
  }, [])

  const pesos = historial?.pesos ?? []
  const ultimo = pesos.at(-1) ?? null
  const hoy = aDiaISO(new Date())
  const disponibleDesde = disponibleServidor ?? (ultimo ? aDiaISO(sumarDias(ultimo.fecha, DIAS_ENTRE_REGISTROS)) : null)
  const bloqueado = Boolean(disponibleDesde) && hoy < disponibleDesde
  const puedeCorregir = Boolean(ultimo) && diasEntre(ultimo.fecha, new Date()) <= DIAS_PARA_CORREGIR

  async function ejecutar(accion, valor, textoExito) {
    const kg = pesoValido(valor)
    if (kg === null) return setMensaje({ tipo: 'error', texto: `El peso debe estar entre ${PESO_MINIMO} y ${PESO_MAXIMO} kg.` })
    setEnviando(true)
    setMensaje(null)
    try {
      await accion(perfil.id, kg)
      setDisponibleServidor(null)
      setPeso('')
      setCorrigiendo(false)
      setMensaje({ tipo: 'exito', texto: textoExito })
      await recargar()
    } catch (err) {
      if (err.detalles?.disponibleDesde) setDisponibleServidor(err.detalles.disponibleDesde)
      setMensaje({ tipo: 'error', texto: err.message })
    } finally {
      setEnviando(false)
    }
  }

  const objetivoActual = historial?.cliente.objetivoActual ?? null

  function abrirObjetivo() {
    setObjetivoElegido(objetivoActual ?? '')
    setErrorObjetivo(null)
    setEditandoObjetivo(true)
  }

  async function guardarObjetivo(evento) {
    evento.preventDefault()
    if (!objetivoElegido || objetivoElegido === objetivoActual) {
      setEditandoObjetivo(false)
      return
    }
    setGuardandoObjetivo(true)
    setErrorObjetivo(null)
    try {
      await cambiarObjetivo(perfil.id, objetivoElegido)
      setEditandoObjetivo(false)
      setMensaje({ tipo: 'exito', texto: 'Objetivo actualizado.' })
      recargar()
    } catch (err) {
      setErrorObjetivo(err.message)
    } finally {
      setGuardandoObjetivo(false)
    }
  }

  const bloqueObjetivo = (
    <div className="bg-white px-6 py-4 shadow-lg">
      {editandoObjetivo ? (
        <form onSubmit={guardarObjetivo} className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-sm text-navy-900">
            Nuevo objetivo
            <select
              value={objetivoElegido}
              disabled={guardandoObjetivo}
              onChange={(evento) => setObjetivoElegido(evento.target.value)}
              className="border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {Object.entries(OBJETIVOS).map(([valor, nombre]) => (
                <option key={valor} value={valor}>
                  {nombre}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={guardandoObjetivo}
            className="bg-accent hover:bg-accent-light disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 transition-colors"
          >
            {guardandoObjetivo ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            disabled={guardandoObjetivo}
            onClick={() => setEditandoObjetivo(false)}
            className="border border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white disabled:opacity-50 text-sm font-semibold px-4 py-2 transition-colors"
          >
            Cancelar
          </button>
          {errorObjetivo && <p className="basis-full text-sm text-red-700">{errorObjetivo}</p>}
        </form>
      ) : (
        <button type="button" onClick={abrirObjetivo} className="text-sm font-semibold text-navy-700 hover:text-accent">
          Cambiar objetivo
        </button>
      )}
    </div>
  )

  const registrar = (evento) => {
    evento.preventDefault()
    ejecutar(registrarPeso, peso, 'Peso registrado.')
  }

  const corregir = (evento) => {
    evento.preventDefault()
    ejecutar(corregirUltimoPeso, pesoCorreccion, 'Último peso corregido.')
  }

  return (
    <>
      <h1 className="text-2xl text-navy-900 mb-6">Mi progreso</h1>

      {mensaje && (
        <p
          className={`mb-4 text-sm px-4 py-3 ${
            mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      <Estado cargando={perfil.cargando || (Boolean(perfil.id) && cargando)} error={perfil.error ?? error}>
        {historial && (
          <div className="flex flex-col gap-6">
            {pesos.length > 0 ? (
              <>
                <ResumenSeguimiento historial={historial} />
                {bloqueObjetivo}
                <GraficaPeso pesos={pesos} cambiosObjetivo={historial.cambiosObjetivo} />
              </>
            ) : (
              <div className="bg-white p-6 shadow-lg text-sm text-slate-500">Registra tu primer peso para ver tu evolución.</div>
            )}

            <div className="bg-white p-6 shadow-lg">
              <h2 className="font-semibold text-navy-900 mb-4">Registrar peso</h2>
              <form onSubmit={registrar} className="flex flex-wrap items-end gap-4">
                <label className="flex flex-col gap-1 text-sm text-navy-900">
                  Peso (kg)
                  <input
                    type="number"
                    required
                    min={PESO_MINIMO}
                    max={PESO_MAXIMO}
                    step="any"
                    disabled={bloqueado || enviando}
                    value={peso}
                    onChange={(evento) => setPeso(evento.target.value)}
                    className={`${campo} disabled:bg-slate-100`}
                  />
                </label>
                <button
                  type="submit"
                  disabled={bloqueado || enviando}
                  className="bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 transition-colors"
                >
                  {bloqueado ? `Podrás registrar tu peso a partir del ${formatearFecha(disponibleDesde)}` : enviando ? 'Guardando...' : 'Registrar peso'}
                </button>
              </form>

              {puedeCorregir && (
                <div className="mt-5 pt-5 border-t border-slate-200">
                  {corrigiendo ? (
                    <form onSubmit={corregir} className="flex flex-wrap items-end gap-4">
                      <label className="flex flex-col gap-1 text-sm text-navy-900">
                        Peso corregido (kg)
                        <input
                          type="number"
                          required
                          min={PESO_MINIMO}
                          max={PESO_MAXIMO}
                          step="any"
                          disabled={enviando}
                          value={pesoCorreccion}
                          onChange={(evento) => setPesoCorreccion(evento.target.value)}
                          className={campo}
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={enviando}
                        className="bg-accent hover:bg-accent-light disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 transition-colors"
                      >
                        {enviando ? 'Guardando...' : 'Guardar corrección'}
                      </button>
                      <button
                        type="button"
                        disabled={enviando}
                        onClick={() => setCorrigiendo(false)}
                        className="border border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white disabled:opacity-50 text-sm font-semibold px-4 py-2 transition-colors"
                      >
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setPesoCorreccion(String(ultimo.pesoKg))
                        setCorrigiendo(true)
                        setMensaje(null)
                      }}
                      className="text-sm font-semibold text-navy-700 hover:text-accent"
                    >
                      Corregir último peso ({ultimo.pesoKg} kg, {formatearFecha(ultimo.fecha)})
                    </button>
                  )}
                </div>
              )}
            </div>

            <LineaTiempo historial={historial} permitirPdf />
          </div>
        )}
      </Estado>
    </>
  )
}
