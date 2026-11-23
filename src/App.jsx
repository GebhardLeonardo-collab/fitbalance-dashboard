import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Registro from './pages/Registro'
import CambiarPassword from './pages/CambiarPassword'
import OlvidePassword from './pages/OlvidePassword'
import RestablecerPassword from './pages/RestablecerPassword'
import Dashboard from './pages/Dashboard'
import InicioGimnasio from './pages/InicioGimnasio'
import InicioNutricionista from './pages/InicioNutricionista'
import InicioCliente from './pages/InicioCliente'
import Nutricionistas from './pages/Nutricionistas'
import Alianzas from './pages/Alianzas'
import Solicitudes from './pages/Solicitudes'
import AprobacionCuentas from './pages/AprobacionCuentas'
import Clientes from './pages/Clientes'
import MisClientes from './pages/MisClientes'
import ClienteDetalle from './pages/ClienteDetalle'
import MiCiclo from './pages/MiCiclo'
import MiProgreso from './pages/MiProgreso'
import HistorialCliente from './pages/HistorialCliente'
import Notificaciones from './pages/Notificaciones'
import { INICIO_POR_ROL, useSesion } from './context/useSesion'

const inicioDe = (usuario) =>
  usuario.debeCambiarPassword ? '/cambiar-password' : (INICIO_POR_ROL[usuario.rol] ?? '/notificaciones')

function Publica({ children }) {
  const { usuario } = useSesion()
  if (usuario) return <Navigate to={inicioDe(usuario)} replace />
  return children
}

function Privada() {
  const { usuario } = useSesion()
  if (!usuario) return <Navigate to="/login" replace />
  if (usuario.debeCambiarPassword) return <Navigate to="/cambiar-password" replace />
  return <Layout />
}

function SoloConPasswordTemporal() {
  const { usuario } = useSesion()
  if (!usuario) return <Navigate to="/login" replace />
  if (!usuario.debeCambiarPassword) return <Navigate to={inicioDe(usuario)} replace />
  return <CambiarPassword forzado />
}

const INICIOS = { admin: Dashboard, gym: InicioGimnasio, nutricionista: InicioNutricionista, cliente: InicioCliente }

function Inicio() {
  const { usuario } = useSesion()
  const Pantalla = INICIOS[usuario.rol]
  if (!Pantalla) return <Navigate to="/notificaciones" replace />
  return <Pantalla />
}

function SoloRol({ roles, children }) {
  const { usuario } = useSesion()
  if (!roles.includes(usuario.rol)) return <Navigate to={inicioDe(usuario)} replace />
  return children
}

export default function App() {
  const { cargando } = useSesion()

  if (cargando) {
    return <div className="min-h-screen bg-panel p-8 text-sm text-slate-500">Cargando...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={<Publica><Login /></Publica>} />
      <Route path="/registro" element={<Publica><Registro /></Publica>} />
      <Route path="/olvide-password" element={<OlvidePassword />} />
      <Route path="/restablecer-password" element={<RestablecerPassword />} />
      <Route path="/cambiar-password" element={<SoloConPasswordTemporal />} />

      <Route element={<Privada />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/nutricionistas" element={<SoloRol roles={['gym']}><Nutricionistas /></SoloRol>} />
        <Route path="/solicitudes" element={<SoloRol roles={['nutricionista']}><Solicitudes /></SoloRol>} />
        <Route path="/aprobacion-cuentas" element={<SoloRol roles={['admin']}><AprobacionCuentas /></SoloRol>} />
        <Route path="/alianzas" element={<SoloRol roles={['gym', 'nutricionista']}><Alianzas /></SoloRol>} />
        <Route path="/clientes" element={<SoloRol roles={['gym']}><Clientes /></SoloRol>} />
        <Route path="/clientes/:id/historial" element={<SoloRol roles={['gym']}><HistorialCliente /></SoloRol>} />
        <Route path="/mis-clientes" element={<SoloRol roles={['nutricionista']}><MisClientes /></SoloRol>} />
        <Route path="/mis-clientes/:id" element={<SoloRol roles={['nutricionista']}><ClienteDetalle /></SoloRol>} />
        <Route path="/mi-ciclo" element={<SoloRol roles={['cliente']}><MiCiclo /></SoloRol>} />
        <Route path="/mi-progreso" element={<SoloRol roles={['cliente']}><MiProgreso /></SoloRol>} />
        <Route path="/cuenta/password" element={<CambiarPassword />} />
        <Route path="/notificaciones" element={<Notificaciones />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
