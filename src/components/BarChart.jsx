const NUM_DIVISIONES = 5

// Devuelve un paso "redondo" (1, 2, 5, 10, 20, 50...) para el eje Y
function calcularPaso(valorMaximo) {
  const bruto = valorMaximo / NUM_DIVISIONES
  if (bruto <= 1) return 1

  const magnitud = 10 ** Math.floor(Math.log10(bruto))
  const normalizado = bruto / magnitud

  if (normalizado <= 1) return magnitud
  if (normalizado <= 2) return 2 * magnitud
  if (normalizado <= 5) return 5 * magnitud
  return 10 * magnitud
}

export default function BarChart({ meses = [], anioActual, anioAnterior }) {
  const valorMaximo = Math.max(0, ...meses.flatMap((m) => [m.anterior, m.actual]))
  const paso = calcularPaso(valorMaximo)
  const maximo = paso * NUM_DIVISIONES
  const marcas = Array.from({ length: NUM_DIVISIONES + 1 }, (_, i) => maximo - i * paso)

  return (
    <div className="bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-navy-900">Ciclos completados</h2>
        <button className="bg-accent hover:bg-accent-light text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors">
          Ver detalle
        </button>
      </div>

      <div className="flex gap-6">
        <div className="flex flex-col justify-between h-48 pr-1 text-[11px] text-slate-400 shrink-0">
          {marcas.map((marca) => (
            <span key={marca}>{marca}</span>
          ))}
        </div>

        <div className="flex-1">
          <div className="relative h-48">
            <div className="absolute inset-0 flex flex-col justify-between">
              {marcas.map((marca) => (
                <div key={marca} className="border-t border-slate-200" />
              ))}
            </div>

            <div className="relative h-full flex items-end gap-3">
              {meses.map((dato) => (
                <div key={dato.mes} className="flex-1 h-full flex items-end justify-center gap-1">
                  <div
                    className="w-1/3 bg-navy-700"
                    style={{ height: `${(dato.anterior / maximo) * 100}%` }}
                  />
                  <div
                    className="w-1/3 bg-accent" /*emerald*/
                    style={{ height: `${(dato.actual / maximo) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            {meses.map((dato) => (
              <span key={dato.mes} className="flex-1 text-center text-[10px] text-slate-400">
                {dato.mes}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-navy-700" />
            <span className="text-xs text-slate-500">{anioAnterior}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-accent" />
            <span className="text-xs text-slate-500">{anioActual}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
