export default function Estado({ cargando, error, vacio, textoVacio, children }) {
  if (cargando) {
    return <div className="bg-white p-6 shadow-lg text-sm text-slate-500">Cargando...</div>
  }
  if (error) {
    return (
      <div className="bg-white p-6 shadow-lg">
        <h2 className="font-semibold text-navy-900 mb-2">No se pudo cargar la información</h2>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    )
  }
  if (vacio) {
    return <div className="bg-white p-6 shadow-lg text-sm text-slate-500">{textoVacio}</div>
  }
  return children
}
