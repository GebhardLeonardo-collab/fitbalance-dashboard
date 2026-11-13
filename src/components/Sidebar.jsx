import { LayoutDashboard, Users, RefreshCw, Handshake, BarChart3, User } from 'lucide-react'

const enlaces = [
  { nombre: 'Inicio', icono: LayoutDashboard, activo: true },
  { nombre: 'Clientes', icono: Users, activo: false },
  { nombre: 'Ciclos', icono: RefreshCw, activo: false },
  { nombre: 'Alianzas', icono: Handshake, activo: false },
  { nombre: 'Reportes', icono: BarChart3, activo: false },
]

export default function Sidebar() {
  return (
    <aside className="w-full md:w-64 shrink-0 bg-gradient-to-b from-navy-600 to-navy-800 text-white px-6 py-10">
      <div className="flex flex-col items-center mb-10">
        <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-xl mb-4">
          <User size={64} strokeWidth={1.5} className="text-navy-700" />
        </div>
        <p className="text-xl font-semibold uppercase tracking-widest">Admin</p>
        <p className="text-xs text-slate-300 mt-1">admin@fitbalance.com</p>
      </div>

      <nav className="flex flex-col">
        {enlaces.map((enlace) => (
          <a
            key={enlace.nombre}
            href="#"
            className={`flex items-center gap-5 py-4 border-b border-white/10 text-[15px] transition-colors ${
              enlace.activo ? 'text-accent' : 'text-white hover:text-accent'
            }`}
          >
            <enlace.icono size={20} />
            {enlace.nombre}
          </a>
        ))}
      </nav>
    </aside>
  )
}