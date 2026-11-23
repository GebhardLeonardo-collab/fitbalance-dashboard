const COEFICIENTES_CEDULA = [2, 1, 2, 1, 2, 1, 2, 1, 2]
const CELULAR = /^09\d{8}$/
const CONVENCIONAL = /^0[2-7]\d{7}$/
const PROVINCIA_MAXIMA = 24

export const EDAD_MINIMA = 18
export const EDAD_MAXIMA = 100

export const normalizarTelefono = (texto) => texto.replace(/[\s-]/g, '')

export function validarCedula(texto) {
  const cedula = texto.trim()
  if (!/^\d{10}$/.test(cedula)) return 'La cédula debe tener 10 dígitos numéricos.'
  const provincia = Number(cedula.slice(0, 2))
  if (provincia < 1 || provincia > PROVINCIA_MAXIMA) return `La cédula tiene una provincia inválida (01 a ${PROVINCIA_MAXIMA}).`
  if (Number(cedula[2]) >= 6) return 'La cédula no es válida: el tercer dígito debe ser menor que 6.'
  if (/^(\d)\1{9}$/.test(cedula)) return 'La cédula no es válida: no puede tener todos los dígitos iguales.'
  const suma = COEFICIENTES_CEDULA.reduce((total, coeficiente, i) => {
    const producto = Number(cedula[i]) * coeficiente
    return total + (producto > 9 ? producto - 9 : producto)
  }, 0)
  if ((10 - (suma % 10)) % 10 !== Number(cedula[9])) return 'La cédula no es válida: el dígito verificador no coincide.'
  return null
}

export function validarCelular(texto) {
  return CELULAR.test(normalizarTelefono(texto)) ? null : 'Ingresa un celular de 10 dígitos que empiece con 09.'
}

export function validarTelefonoGimnasio(texto) {
  const telefono = normalizarTelefono(texto)
  if (CELULAR.test(telefono) || CONVENCIONAL.test(telefono)) return null
  return 'Ingresa un celular de 10 dígitos (09...) o un convencional de 9 dígitos (02 a 07...).'
}

export const aTextoLocal = (fecha) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`

export function rangoFechaNacimiento(hoy = new Date()) {
  return {
    minima: aTextoLocal(new Date(hoy.getFullYear() - EDAD_MAXIMA, hoy.getMonth(), hoy.getDate())),
    maxima: aTextoLocal(new Date(hoy.getFullYear() - EDAD_MINIMA, hoy.getMonth(), hoy.getDate())),
  }
}

export function validarFechaNacimiento(texto, hoy = new Date()) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto)
  if (!partes) return 'Ingresa una fecha de nacimiento válida.'
  const [anio, mes, dia] = partes.slice(1).map(Number)
  const fecha = new Date(2000, 0, 1)
  fecha.setFullYear(anio, mes - 1, dia)
  if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) return 'La fecha de nacimiento no existe.'
  if (fecha > hoy) return 'La fecha de nacimiento no puede ser futura.'
  const { minima, maxima } = rangoFechaNacimiento(hoy)
  if (texto > maxima) return `El cliente debe tener al menos ${EDAD_MINIMA} años cumplidos.`
  if (texto < minima) return `El cliente no puede tener más de ${EDAD_MAXIMA} años.`
  return null
}
