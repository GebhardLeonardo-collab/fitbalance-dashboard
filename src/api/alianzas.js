import { conFiltros, pedir } from './http'

export const listarAlianzas = (filtros) => pedir(conFiltros('/api/alianzas', filtros))

export const solicitarAlianza = (gimnasioId, nutricionistaId) =>
  pedir('/api/alianzas', { metodo: 'POST', cuerpo: { gimnasioId, nutricionistaId } })

export const cambiarEstadoAlianza = (id, estado) =>
  pedir(`/api/alianzas/${id}`, { metodo: 'PUT', cuerpo: { estado } })
