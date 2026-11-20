import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import Estado from '../components/Estado'
import ConfirmarAccion from '../components/ConfirmarAccion'
import NuevoCliente from '../components/NuevoCliente'
import { listarClientes } from '../api/clientes'
import { abrirCiclo, cancelarCiclo } from '../api/ciclos'
import { CICLOS_EN_CURSO, ESTADOS_CICLO, OBJETIVOS, TOTAL_REGISTROS } from '../utils/etiquetas'

const estiloBoton =
  'border border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white text-xs font-semibold px-3 py-1.5 transition-colors'

export default function Clientes() {
  const [estado, setEstado] = useState({ cargando: true, error: null, datos: [] })
  const [creando, setCreando] = useState(false)
  const [aAbrir, setAAbrir] = useState(null)
  const [aCancelar, setACancelar] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const cargar = useCallback(
    () =>
      listarClientes()
        .then((datos) => setEstado({ cargando: false, error: null, datos }))
        .catch((err) => setEstado({ cargando: false, error: err.message, datos: [] })),
    [],
  )

  useEffect(() => {
    cargar()
  }, [cargar])

  async function confirmarApertura() {
    setEnviando(true)
    setMensaje(null)
    try {
      await abrirCiclo(aAbrir.id)
      setMensaje({ tipo: 'exito', texto: `Ciclo abierto para ${aAbrir.usuario?.nombre ?? 'el cliente'}.` })
      await cargar()
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    } finally {
      setEnviando(false)
      setAAbrir(null)
    }
  }

  async function confirmarCancelacion() {
    setEnviando(true)
    setMensaje(null)
    try {
      await cancelarCiclo(aCancelar.cicloActual.id)
      setMensaje({ tipo: 'exito', texto: `Ciclo cancelado para ${aCancelar.usuario?.nombre ?? 'el cliente'}.` })
      await cargar()
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    } finally {
      setEnviando(false)
      setACancelar(null)
    }
  }

  function clienteCreado() {
    setCreando(false)
    setMensaje({ tipo: 'exito', texto: 'Cliente creado.' })
    cargar()
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl text-navy-900">Clientes</h1>
        <button
          type="button"
          onClick={() => setCreando(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          <Plus size={16} />
          Nuevo cliente
        </button>
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

      <Estado
        cargando={estado.cargando}
        error={estado.error}
        vacio={estado.datos.length === 0}
        textoVacio="Todavía no tienes clientes."
      >
        <div className="bg-white p-6 shadow-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
                <th className="pb-3 font-semibold">Cliente</th>
                <th className="pb-3 font-semibold">Objetivo</th>
                <th className="pb-3 font-semibold">IMC</th>
                <th className="pb-3 font-semibold">Ciclo actual</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {estado.datos.map((cliente) => {
                const ciclo = cliente.cicloActual
                const enCurso = Boolean(ciclo) && CICLOS_EN_CURSO.includes(ciclo.estado)
                return (
                  <tr key={cliente.id} className="border-b border-slate-100">
                    <td className="py-3">
                      <p className="font-semibold text-navy-900">{cliente.usuario?.nombre ?? '—'}</p>
                      <p className="text-xs text-slate-500">{cliente.usuario?.email}</p>
                    </td>
                    <td className="py-3 text-slate-600">{OBJETIVOS[cliente.objetivo] ?? '—'}</td>
                    <td className="py-3 text-slate-600">{cliente.imc ?? '—'}</td>
                    <td className="py-3">
                      {ciclo ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold ${
                              enCurso ? 'bg-accent/15 text-accent' : 'bg-navy-700/10 text-navy-700'
                            }`}
                          >
                            {ESTADOS_CICLO[ciclo.estado] ?? ciclo.estado}
                          </span>
                          <span className="text-xs text-slate-500">
                            {ciclo.registrosConfirmados}/{TOTAL_REGISTROS}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Sin ciclo</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {!enCurso && (
                        <button type="button" onClick={() => setAAbrir(cliente)} className={estiloBoton}>
                          Abrir ciclo
                        </button>
                      )}
                      {enCurso && (
                        <button
                          type="button"
                          onClick={() => setACancelar(cliente)}
                          className="border border-red-600 text-red-700 hover:bg-red-600 hover:text-white text-xs font-semibold px-3 py-1.5 transition-colors"
                        >
                          Cancelar ciclo
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Estado>

      {creando && <NuevoCliente onCerrar={() => setCreando(false)} onCreado={clienteCreado} />}

      {aCancelar && (
        <ConfirmarAccion
          titulo={`¿Cancelar el ciclo de ${aCancelar.usuario?.nombre ?? 'el cliente'}?`}
          mensaje="El cliente ya no podrá registrar ni enviar sus comidas en este ciclo. Esta acción no se puede deshacer."
          textoConfirmar="Sí, cancelar ciclo"
          advertencia
          enviando={enviando}
          onConfirmar={confirmarCancelacion}
          onCerrar={() => setACancelar(null)}
        />
      )}

      {aAbrir && (
        <ConfirmarAccion
          titulo={`¿Abrir un ciclo para ${aAbrir.usuario?.nombre ?? 'el cliente'}?`}
          mensaje={`El cliente tendrá 7 días para registrar sus ${TOTAL_REGISTROS} comidas.`}
          textoConfirmar="Sí, abrir ciclo"
          enviando={enviando}
          onConfirmar={confirmarApertura}
          onCerrar={() => setAAbrir(null)}
        />
      )}
    </>
  )
}
