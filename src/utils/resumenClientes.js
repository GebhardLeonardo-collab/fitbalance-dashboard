export function resumirClientes(clientes) {
  const resumen = { total: clientes.length, en_registro: 0, enviado: 0, evaluado: 0, sinCiclo: 0, cerrados: 0 }
  for (const cliente of clientes) {
    const estado = cliente.cicloActual?.estado
    if (!estado) resumen.sinCiclo += 1
    else if (estado === 'vencido' || estado === 'cancelado') resumen.cerrados += 1
    else resumen[estado] += 1
  }
  return resumen
}
