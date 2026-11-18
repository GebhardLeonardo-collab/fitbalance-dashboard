import { conFiltros, pedir } from './http'

export const listarRegistros = (cicloId) => pedir(conFiltros('/api/registros-comida', { cicloId }))

export const subirRegistro = (formulario) => pedir('/api/registros-comida', { metodo: 'POST', cuerpo: formulario })

export const obtenerImagen = (id) => pedir(`/api/registros-comida/${id}/imagen`, { blob: true })

export const confirmarRegistro = (id, alimentos) =>
  pedir(`/api/registros-comida/${id}`, { metodo: 'PUT', cuerpo: { alimentos, confirmado: true } })

export const eliminarRegistro = (id) => pedir(`/api/registros-comida/${id}`, { metodo: 'DELETE' })
