import { conFiltros, pedir } from './http'

export const listarClientes = (filtros) => pedir(conFiltros('/api/clientes', filtros))

export const crearCliente = (datos) => pedir('/api/clientes', { metodo: 'POST', cuerpo: datos })

export const obtenerCliente = (id) => pedir(`/api/clientes/${id}`)

export const cambiarFrecuencia = (id, frecuenciaEvaluacion) =>
  pedir(`/api/clientes/${id}`, { metodo: 'PUT', cuerpo: { frecuenciaEvaluacion } })
