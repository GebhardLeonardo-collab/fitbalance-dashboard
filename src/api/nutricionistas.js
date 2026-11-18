import { conFiltros, pedir } from './http'

export const listarNutricionistas = (filtros) => pedir(conFiltros('/api/nutricionistas', filtros))

export const buscarMiGimnasio = async (usuarioId) =>
  (await pedir(conFiltros('/api/gimnasios', { usuarioId })))[0] ?? null
