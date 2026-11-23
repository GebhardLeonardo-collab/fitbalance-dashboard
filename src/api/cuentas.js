import { conFiltros, pedir } from './http'

export const listarSolicitudesCuenta = (filtros) => pedir(conFiltros('/api/solicitudes', filtros))

export const aprobarCuenta = (usuarioId) => pedir(`/api/solicitudes/${usuarioId}/aprobar`, { metodo: 'POST' })

export const rechazarCuenta = (usuarioId, motivo) =>
  pedir(`/api/solicitudes/${usuarioId}/rechazar`, { metodo: 'POST', cuerpo: motivo ? { motivo } : {} })
