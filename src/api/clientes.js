import { conFiltros, pedir } from './http'

export const listarClientes = (filtros) => pedir(conFiltros('/api/clientes', filtros))

export const crearCliente = (datos) => pedir('/api/clientes', { metodo: 'POST', cuerpo: datos })
