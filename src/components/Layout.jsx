import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import Campana from './Campana'

export default function Layout() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="min-h-screen md:flex">
      <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />

      <div className="flex-1 min-w-0 bg-panel flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-4 sm:px-8 pt-6 pb-2">
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
            className="md:hidden p-1 text-navy-900"
          >
            <Menu size={28} />
          </button>
          <span className="hidden md:block" />
          <Campana />
        </header>

        <main className="flex-1 px-4 sm:px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
