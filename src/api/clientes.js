import { conFiltros, pedir } from './http'

export const listarClientes = (filtros) => pedir(conFiltros('/api/clientes', filtros))

export const crearCliente = (datos) => pedir('/api/clientes', { metodo: 'POST', cuerpo: datos })

export const obtenerCliente = (id) => pedir(`/api/clientes/${id}`)

export const cambiarFrecuencia = (id, frecuenciaEvaluacion) =>
  pedir(`/api/clientes/${id}`, { metodo: 'PUT', cuerpo: { frecuenciaEvaluacion } })

export const cambiarObjetivo = (id, objetivo) => pedir(`/api/clientes/${id}`, { metodo: 'PUT', cuerpo: { objetivo } })

export const obtenerHistorial = (id) => pedir(`/api/clientes/${id}/historial`)

export const registrarPeso = (id, pesoKg) => pedir(`/api/clientes/${id}/pesos`, { metodo: 'POST', cuerpo: { pesoKg } })

export const corregirUltimoPeso = (id, pesoKg) => pedir(`/api/clientes/${id}/pesos/ultimo`, { metodo: 'PUT', cuerpo: { pesoKg } })
