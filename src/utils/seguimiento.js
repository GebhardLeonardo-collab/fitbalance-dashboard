import { useCallback, useEffect, useState } from 'react'
import { obtenerHistorial } from '../api/clientes'

export const DIAS_ENTRE_REGISTROS = 30
export const DIAS_PARA_CORREGIR = 7
const DIA_MS = 24 * 60 * 60 * 1000

const dosDigitos = (n) => String(n).padStart(2, '0')

function aFecha(valor) {
  if (valor instanceof Date) return valor
  const dia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  return dia ? new Date(Number(dia[1]), Number(dia[2]) - 1, Number(dia[3])) : new Date(valor)
}

export function formatearFecha(valor) {
  const fecha = aFecha(valor)
  return `${dosDigitos(fecha.getDate())}-${dosDigitos(fecha.getMonth() + 1)}-${fecha.getFullYear()}`
}

export const aDiaISO = (valor) => {
  const fecha = aFecha(valor)
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`
}

const marcaDelDia = (valor) => {
  const fecha = aFecha(valor)
  return Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
}

export const diasEntre = (desde, hasta) => Math.round((marcaDelDia(hasta) - marcaDelDia(desde)) / DIA_MS)

export function sumarDias(valor, dias) {
  const fecha = aFecha(valor)
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias)
}

export function calcularResumen(historial) {
  const pesos = historial.pesos
  const primero = pesos[0]?.pesoKg ?? null
  const actual = historial.cliente.pesoActualKg ?? pesos.at(-1)?.pesoKg ?? null
  const variacion = primero !== null && actual !== null && pesos.length > 1 ? Math.round((actual - primero) * 10) / 10 : null
  return { objetivoActual: historial.cliente.objetivoActual, pesoActual: actual, variacion }
}

export function mezclarLinea(historial) {
  const ciclos = historial.ciclos.map((ciclo) => ({ tipo: 'ciclo', fecha: ciclo.fechaInicio, ciclo }))
  const cambios = historial.cambiosObjetivo.map((cambio) => ({ tipo: 'cambio', fecha: cambio.fecha, cambio }))
  return [...ciclos, ...cambios].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
}

export function useHistorial(clienteId) {
  const [estado, setEstado] = useState({ cargando: true, error: null, estadoHttp: null, historial: null })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!clienteId) return undefined
    let vigente = true
    obtenerHistorial(clienteId)
      .then((historial) => vigente && setEstado({ cargando: false, error: null, estadoHttp: null, historial }))
      .catch((err) => vigente && setEstado({ cargando: false, error: err.message, estadoHttp: err.status ?? null, historial: null }))
    return () => {
      vigente = false
    }
  }, [clienteId, version])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])

  return { ...estado, recargar }
}
