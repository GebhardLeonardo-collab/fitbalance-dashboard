export const normalizarTexto = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

export function filtrarClientes(clientes, busqueda) {
  const buscado = normalizarTexto(busqueda)
  if (!buscado) return clientes
  return clientes.filter(({ usuario }) => normalizarTexto(`${usuario?.nombre ?? ''} ${usuario?.email ?? ''}`).includes(buscado))
}
