import { pedir } from './http'

export const EVENTO_NOTIFICACIONES = 'fitbalance:notificaciones'

export const avisarCambioNotificaciones = () => window.dispatchEvent(new Event(EVENTO_NOTIFICACIONES))

export const listarNotificaciones = () => pedir('/api/notificaciones')

export const contarNoLeidas = () => pedir('/api/notificaciones/no-leidas/contador')

export const marcarLeida = (id) => pedir(`/api/notificaciones/${id}`, { metodo: 'PUT', cuerpo: { leida: true } })

export const marcarTodasLeidas = () => pedir('/api/notificaciones/marcar-todas-leidas', { metodo: 'PUT' })
