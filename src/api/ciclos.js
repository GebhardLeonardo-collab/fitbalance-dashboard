import { pedir } from './http'

export const abrirCiclo = (clienteId) => pedir('/api/ciclos', { metodo: 'POST', cuerpo: { clienteId } })

export const enviarCiclo = (id) => pedir(`/api/ciclos/${id}`, { metodo: 'PUT', cuerpo: { estado: 'enviado' } })
