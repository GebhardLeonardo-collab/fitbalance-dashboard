import FotoRegistro from './FotoRegistro'
import { COMIDAS } from '../utils/etiquetas'

const DIAS = [1, 2, 3]

const resumen = (totales = {}) =>
  `${totales.calorias ?? 0} kcal · P ${totales.proteinas ?? 0} g · C ${totales.carbohidratos ?? 0} g · G ${totales.grasas ?? 0} g`

export default function RegistrosDelCiclo({ registros, totalesPorDia = [] }) {
  return (
    <div className="flex flex-col gap-5">
      {DIAS.map((dia) => (
        <section key={dia} className="bg-white p-5 shadow-lg">
          <h3 className="font-semibold text-navy-900 mb-4">Día {dia}</h3>

          <div className="divide-y divide-slate-100">
            {COMIDAS.map(([tipoComida, etiqueta]) => {
              const registro = registros.find((r) => r.dia === dia && r.tipoComida === tipoComida)
              return (
                <div key={tipoComida} className="py-4 first:pt-0 flex flex-col sm:flex-row gap-4">
                  {registro ? (
                    <FotoRegistro registroId={registro.id} className="w-full sm:w-28 h-40 sm:h-28 shrink-0" />
                  ) : (
                    <div className="w-full sm:w-28 h-20 sm:h-28 shrink-0 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                      Sin foto
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-navy-900">{etiqueta}</p>
                    {registro ? (
                      <>
                        <ul className="mt-1 text-sm text-slate-600">
                          {registro.alimentos.map((alimento, indice) => (
                            <li key={indice}>
                              {alimento.nombre}
                              {alimento.porcion && <span className="text-slate-500"> · {alimento.porcion}</span>}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-xs text-slate-500">Total de la comida: {resumen(registro.totales)}</p>
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-slate-500">Sin registro.</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <p className="mt-2 pt-3 border-t border-slate-200 text-sm font-semibold text-navy-900">
            Total del día: {resumen(totalesPorDia.find((total) => total.dia === dia))}
          </p>
        </section>
      ))}
    </div>
  )
}
