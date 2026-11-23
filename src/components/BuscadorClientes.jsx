import { Search } from 'lucide-react'

export default function BuscadorClientes({ valor, onCambiar }) {
  return (
    <label className="relative block max-w-md mb-4">
      <span className="sr-only">Buscar por nombre o correo</span>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="search"
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        placeholder="Buscar por nombre o correo"
        autoComplete="off"
        className="w-full bg-white border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-accent"
      />
    </label>
  )
}
