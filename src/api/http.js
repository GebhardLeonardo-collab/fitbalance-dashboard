const API_URL = import.meta.env.VITE_API_URL
const CLAVE_TOKEN = 'fitbalance.token'
const CODIGO_PASSWORD_INCORRECTA = 'PASSWORD_ACTUAL_INCORRECTA'

let alPerderSesion = () => {}

export class ErrorApi extends Error {
  constructor(mensaje, status, extra = {}) {
    super(mensaje)
    this.status = status
    Object.assign(this, extra)
  }
}

export const leerToken = () => sessionStorage.getItem(CLAVE_TOKEN)
export const guardarToken = (token) => sessionStorage.setItem(CLAVE_TOKEN, token)
export const borrarToken = () => sessionStorage.removeItem(CLAVE_TOKEN)

export function registrarCierreDeSesion(funcion) {
  alPerderSesion = funcion
}

export function leerPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

function minutosDeEspera(respuesta, mensaje) {
  const segundos = Number(respuesta.headers.get('Retry-After'))
  if (segundos > 0) return Math.ceil(segundos / 60)
  const encontrado = /(\d+)\s*minuto/.exec(mensaje ?? '')
  return encontrado ? Number(encontrado[1]) : null
}

export async function pedir(ruta, { metodo = 'GET', cuerpo, publica = false, blob = false } = {}) {
  const headers = {}
  const token = leerToken()
  const esFormulario = cuerpo instanceof FormData
  if (token && !publica) headers.Authorization = `Bearer ${token}`
  if (cuerpo !== undefined && !esFormulario) headers['Content-Type'] = 'application/json'

  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo === undefined ? undefined : esFormulario ? cuerpo : JSON.stringify(cuerpo),
    })
  } catch {
    throw new ErrorApi('No se pudo conectar con el servidor de FitBalance', 0)
  }

  if (blob && respuesta.ok) return respuesta.blob()
  const datos = respuesta.status === 204 ? null : await respuesta.json().catch(() => null)
  if (respuesta.ok) return datos

  const mensaje = datos?.message ?? `Error ${respuesta.status} del servidor`
  const esPasswordIncorrecta = datos?.detalles?.codigo === CODIGO_PASSWORD_INCORRECTA
  if (respuesta.status === 401 && !publica && !esPasswordIncorrecta) alPerderSesion('Tu sesión expiró o ya no es válida. Inicia sesión de nuevo.')
  if (respuesta.status === 429) {
    const minutos = minutosDeEspera(respuesta, mensaje)
    const texto = minutos
      ? `Demasiados intentos fallidos. Podrás reintentar en ${minutos} minuto${minutos === 1 ? '' : 's'}.`
      : mensaje
    throw new ErrorApi(texto, 429, { minutos })
  }
  throw new ErrorApi(mensaje, respuesta.status, { detalles: datos?.detalles })
}

export function conFiltros(ruta, filtros = {}) {
  const parametros = new URLSearchParams(Object.entries(filtros).filter(([, valor]) => valor !== '' && valor != null))
  const texto = parametros.toString()
  return texto ? `${ruta}?${texto}` : ruta
}
