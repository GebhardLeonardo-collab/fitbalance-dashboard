import { useCallback, useEffect, useMemo, useState } from 'react'
import { cambiarPassword as cambiarPasswordApi, iniciarSesion, obtenerUsuario } from '../api/auth'
import { ErrorApi, borrarToken, guardarToken, leerPayload, leerToken, registrarCierreDeSesion } from '../api/http'
import { SesionContext } from './useSesion'

const MENSAJE_RELOGIN = 'Tu contraseña se actualizó. Inicia sesión con la nueva.'

function tokenVigente() {
  const token = leerToken()
  const payload = token ? leerPayload(token) : null
  if (payload?.id && payload.exp * 1000 > Date.now()) return payload
  borrarToken()
  return null
}

const datosDeUsuario = ({ id, nombre, email, rol }) => ({ id, nombre, email, rol, debeCambiarPassword: false })

const usuarioDeToken = ({ id, rol }) => ({ id, nombre: null, email: null, rol, debeCambiarPassword: true })

export function SesionProvider({ children }) {
  const [inicial] = useState(tokenVigente)
  const [usuario, setUsuario] = useState(() => (inicial?.debeCambiarPassword ? usuarioDeToken(inicial) : null))
  const [cargando, setCargando] = useState(Boolean(inicial) && !inicial.debeCambiarPassword)
  const [aviso, setAviso] = useState(null)

  const cerrarSesion = useCallback((motivo = null) => {
    borrarToken()
    setUsuario(null)
    setAviso(motivo)
  }, [])

  useEffect(() => {
    registrarCierreDeSesion(cerrarSesion)
  }, [cerrarSesion])

  useEffect(() => {
    if (!inicial || inicial.debeCambiarPassword) return
    obtenerUsuario(inicial.id)
      .then((datos) => setUsuario(datosDeUsuario(datos)))
      .catch(() => borrarToken())
      .finally(() => setCargando(false))
  }, [inicial])

  useEffect(() => {
    if (!usuario) return
    const payload = leerPayload(leerToken() ?? '')
    const restante = payload ? payload.exp * 1000 - Date.now() : 0
    const temporizador = setTimeout(
      () => cerrarSesion('Tu sesión expiró. Inicia sesión de nuevo.'),
      Math.max(0, restante),
    )
    return () => clearTimeout(temporizador)
  }, [usuario, cerrarSesion])

  const entrar = useCallback(async (email, password) => {
    const { token } = await iniciarSesion(email, password)
    const payload = leerPayload(token)
    if (!payload?.id) throw new ErrorApi('La respuesta del servidor no es válida', 0)
    guardarToken(token)
    if (payload.debeCambiarPassword) {
      setUsuario(usuarioDeToken(payload))
      setAviso(null)
      return
    }
    try {
      setUsuario(datosDeUsuario(await obtenerUsuario(payload.id)))
      setAviso(null)
    } catch (error) {
      borrarToken()
      throw error
    }
  }, [])

  const cambiarPassword = useCallback(async (passwordActual, passwordNueva) => {
    const { token } = await cambiarPasswordApi(passwordActual, passwordNueva)
    const payload = leerPayload(token)
    if (!payload?.id) throw new ErrorApi('La respuesta del servidor no es válida', 0)
    guardarToken(token)
    try {
      setUsuario(datosDeUsuario(await obtenerUsuario(payload.id)))
    } catch {
      cerrarSesion(MENSAJE_RELOGIN)
    }
  }, [cerrarSesion])

  const valor = useMemo(
    () => ({ usuario, cargando, aviso, entrar, cambiarPassword, cerrarSesion }),
    [usuario, cargando, aviso, entrar, cambiarPassword, cerrarSesion],
  )

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}
