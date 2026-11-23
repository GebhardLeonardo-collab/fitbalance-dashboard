import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Handshake, Bell, Inbox, Stethoscope, Users, UserCheck, RefreshCw, User, LogOut, X, KeyRound, ShieldCheck, TrendingUp } from 'lucide-react'
import Particles from './Particles'
import { useSesion } from '../context/useSesion'
import { useNoLeidas } from '../utils/useNoLeidas'

const NOTIFICACIONES = { nombre: 'Notificaciones', ruta: '/notificaciones', icono: Bell }

const CAMBIAR_PASSWORD = { nombre: 'Cambiar contraseña', ruta: '/cuenta/password', icono: KeyRound }

const INICIO = { nombre: 'Inicio', ruta: '/', icono: LayoutDashboard }

const ENLACES_POR_ROL = {
  admin: [INICIO, { nombre: 'Aprobación de cuentas', ruta: '/aprobacion-cuentas', icono: ShieldCheck }, NOTIFICACIONES],
  gym: [
    INICIO,
    { nombre: 'Nutricionistas', ruta: '/nutricionistas', icono: Stethoscope },
    { nombre: 'Mis alianzas', ruta: '/alianzas', icono: Handshake },
    { nombre: 'Clientes', ruta: '/clientes', icono: Users },
    NOTIFICACIONES,
  ],
  cliente: [
    INICIO,
    { nombre: 'Mi ciclo', ruta: '/mi-ciclo', icono: RefreshCw },
    { nombre: 'Mi progreso', ruta: '/mi-progreso', icono: TrendingUp },
    NOTIFICACIONES,
  ],
  nutricionista: [
    INICIO,
    { nombre: 'Solicitudes', ruta: '/solicitudes', icono: Inbox },
    { nombre: 'Mis alianzas', ruta: '/alianzas', icono: Handshake },
    { nombre: 'Mis clientes', ruta: '/mis-clientes', icono: UserCheck },
    NOTIFICACIONES,
  ],
}

const NOMBRE_ROL = { admin: 'Administrador', gym: 'Gimnasio', nutricionista: 'Nutricionista', cliente: 'Cliente' }

const estiloFondo = { position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none' }

export default function Sidebar({ abierto, onCerrar }) {
  const { usuario, cerrarSesion } = useSesion()
  const noLeidas = useNoLeidas()
  const enlaces = [...(ENLACES_POR_ROL[usuario.rol] ?? [NOTIFICACIONES]), CAMBIAR_PASSWORD]

  return (
    <>
      <div
        onClick={onCerrar}
        className={`fixed inset-0 z-30 bg-navy-900/50 md:hidden ${abierto ? 'block' : 'hidden'}`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] overflow-y-auto transition-transform md:relative md:inset-auto md:z-auto md:w-64 md:max-w-none md:overflow-visible md:translate-x-0 isolate shrink-0 bg-gradient-to-b from-navy-600 to-navy-800 text-white px-6 py-10 flex flex-col ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Particles
          style={estiloFondo}
          particleColors={['#ffffff']}
          particleCount={150}
          particleBaseSize={100}
          speed={0.05}
          opacity={0.9}
          glow={0.6}
          twinkle={0.3}
          particleHoverFactor={0.5}
          clickBurst={false}
        />

        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar menú"
          className="md:hidden absolute top-4 right-4 p-1 text-white hover:text-accent"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-xl mb-4">
            <User size={64} strokeWidth={1.5} className="text-navy-700" />
          </div>
          <p className="text-lg font-semibold uppercase tracking-widest break-words max-w-full">{usuario.nombre}</p>
          <p className="text-xs text-slate-300 mt-1 break-all">{usuario.email}</p>
          <p className="mt-3 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold">
            {NOMBRE_ROL[usuario.rol] ?? usuario.rol}
          </p>
        </div>

        <nav className="flex flex-col">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.ruta}
              to={enlace.ruta}
              end={enlace.ruta === '/'}
              onClick={onCerrar}
              className={({ isActive }) =>
                `flex items-center gap-5 py-4 border-b border-white/10 text-[15px] transition-colors ${
                  isActive ? 'text-accent' : 'text-white hover:text-accent'
                }`
              }
            >
              <enlace.icono size={20} />
              {enlace.nombre}
              {enlace.ruta === NOTIFICACIONES.ruta && noLeidas > 0 && (
                <span
                  aria-label={`${noLeidas} sin leer`}
                  className="ml-auto min-w-5 h-5 px-1 rounded-full bg-accent text-white text-[11px] font-semibold flex items-center justify-center"
                >
                  {noLeidas > 99 ? '99+' : noLeidas}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => cerrarSesion()}
          className="mt-auto pt-10 flex items-center gap-5 text-[15px] text-white hover:text-accent transition-colors"
        >
          <LogOut size={20} />
          Cerrar sesión
        </button>
      </aside>
    </>
  )
}
