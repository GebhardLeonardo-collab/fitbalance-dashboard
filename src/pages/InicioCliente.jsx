import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Estado from '../components/Estado'
import { listarClientes } from '../api/clientes'
import { obtenerCiclo } from '../api/ciclos'
import { CICLOS_EN_CURSO, ESTADOS_CICLO, EVALUACIONES, TOTAL_REGISTROS, formatearDia } from '../utils/etiquetas'

const TEXTO_POR_ESTADO = {
  enviado: 'Tu ciclo fue enviado. Tu nutricionista lo está revisando.',
  vencido: 'Este ciclo venció porque se acabó el plazo de registro. Tu gimnasio puede abrir uno nuevo.',
  cancelado: 'Este ciclo fue cancelado por tu gimnasio.',
}

async function cargarCiclo() {
  const ciclo = (await listarClientes())[0]?.cicloActual ?? null
  if (ciclo?.estado !== 'evaluado') return { ciclo, evaluacion: null }
  try {
    return { ciclo, evaluacion: (await obtenerCiclo(ciclo.id)).veredicto?.evaluacion ?? null }
  } catch {
    return { ciclo, evaluacion: null }
  }
}

export default function InicioCliente() {
  const [estado, setEstado] = useState({ cargando: true, error: null, ciclo: null, evaluacion: null })

  useEffect(() => {
    let activo = true
    cargarCiclo()
      .then((datos) => {
        if (activo) setEstado({ cargando: false, error: null, ...datos })
      })
      .catch((err) => {
        if (activo) setEstado({ cargando: false, error: err.message, ciclo: null, evaluacion: null })
      })
    return () => {
      activo = false
    }
  }, [])

  const { ciclo, evaluacion } = estado

  return (
    <>
      <h1 className="text-2xl text-navy-900 mb-6">Inicio</h1>

      <Estado
        cargando={estado.cargando}
        error={estado.error}
        vacio={!ciclo}
        textoVacio="Aún no tienes un ciclo abierto. Tu gimnasio lo abrirá."
      >
        {ciclo && (
          <div className="bg-white p-6 shadow-lg max-w-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-semibold text-navy-900 text-lg">Ciclo {ciclo.numero}</h2>
              <span
                className={`px-2.5 py-1 text-xs font-semibold ${
                  CICLOS_EN_CURSO.includes(ciclo.estado) ? 'bg-accent/15 text-accent' : 'bg-navy-700/10 text-navy-700'
                }`}
              >
                {ESTADOS_CICLO[ciclo.estado] ?? ciclo.estado}
              </span>
            </div>

            {ciclo.estado === 'en_registro' && (
              <div>
                <p className="text-sm text-navy-900 mb-2">
                  {ciclo.registrosConfirmados} de {TOTAL_REGISTROS} registros confirmados
                </p>
                <div className="h-2 bg-slate-200">
                  <div className="h-full bg-accent" style={{ width: `${(ciclo.registrosConfirmados / TOTAL_REGISTROS) * 100}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-3">Fecha límite de registro: {formatearDia(ciclo.fechaLimiteRegistro)}</p>
              </div>
            )}

            {ciclo.estado === 'evaluado' && (
              <p className="text-sm text-navy-900">
                Tu ciclo fue evaluado
                {evaluacion ? (
                  <>
                    : <span className="font-semibold text-accent">{EVALUACIONES[evaluacion] ?? evaluacion}</span>
                  </>
                ) : (
                  '.'
                )}
              </p>
            )}

            {TEXTO_POR_ESTADO[ciclo.estado] && <p className="text-sm text-slate-600">{TEXTO_POR_ESTADO[ciclo.estado]}</p>}

            <Link
              to="/mi-ciclo"
              className="inline-block mt-5 bg-accent hover:bg-accent-light text-white text-sm font-semibold px-5 py-2.5 transition-colors"
            >
              Ir a Mi ciclo
            </Link>
          </div>
        )}
      </Estado>
    </>
  )
}
