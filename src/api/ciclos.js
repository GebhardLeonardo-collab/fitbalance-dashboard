import { pedir } from './http'

export const abrirCiclo = (clienteId) => pedir('/api/ciclos', { metodo: 'POST', cuerpo: { clienteId } })

export const enviarCiclo = (id) => pedir(`/api/ciclos/${id}`, { metodo: 'PUT', cuerpo: { estado: 'enviado' } })

export const obtenerCiclo = (id) => pedir(`/api/ciclos/${id}`)

export const emitirVeredicto = (id, veredicto) =>
  pedir(`/api/ciclos/${id}`, { metodo: 'PUT', cuerpo: { estado: 'evaluado', veredicto } })

export const descargarPdfVeredicto = (id) => pedir(`/api/ciclos/${id}/veredicto/pdf`, { blob: true })
