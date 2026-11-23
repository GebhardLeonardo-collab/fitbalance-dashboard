import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="min-h-screen md:flex">
      <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />

      <div className="flex-1 min-w-0 bg-panel flex flex-col min-h-screen">
        <header className="md:hidden flex items-center px-4 sm:px-8 pt-6 pb-2">
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
            className="p-1 text-navy-900"
          >
            <Menu size={28} />
          </button>
        </header>

        <main className="flex-1 px-4 sm:px-8 pb-8 md:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
