import { pedir } from './http'

export const obtenerResumen = () => pedir('/api/dashboard/resumen')
