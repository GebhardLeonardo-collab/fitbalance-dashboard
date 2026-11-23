import { pedir } from './http'

export const iniciarSesion = (email, password) =>
  pedir('/api/auth/login', { metodo: 'POST', cuerpo: { email, password }, publica: true })

export const registrarGimnasio = (datos) =>
  pedir('/api/auth/registro-gimnasio', { metodo: 'POST', cuerpo: datos, publica: true })

export const registrarNutricionista = (datos) =>
  pedir('/api/auth/registro-nutricionista', { metodo: 'POST', cuerpo: datos, publica: true })

export const olvidePassword = (email) =>
  pedir('/api/auth/olvide-password', { metodo: 'POST', cuerpo: { email }, publica: true })

export const restablecerPassword = (token, passwordNueva) =>
  pedir('/api/auth/restablecer-password', { metodo: 'POST', cuerpo: { token, passwordNueva }, publica: true })

export const obtenerUsuario = (id) => pedir(`/api/usuarios/${id}`)

export const cambiarPassword = (passwordActual, passwordNueva) =>
  pedir('/api/auth/cambiar-password', { metodo: 'POST', cuerpo: { passwordActual, passwordNueva } })
