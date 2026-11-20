export const OBJETIVOS = {
  perder_peso: 'Pérdida de peso',
  ganar_masa_muscular: 'Ganancia muscular',
  mantener_peso: 'Mantener peso',
  mejorar_salud: 'Mejorar salud',
}

export const ESTADOS_CICLO = {
  en_registro: 'En registro',
  enviado: 'Enviado',
  evaluado: 'Evaluado',
  vencido: 'Vencido',
  cancelado: 'Cancelado',
}

export const CICLOS_EN_CURSO = ['en_registro', 'enviado']

export const TOTAL_REGISTROS = 9

export const formatearDia = (iso) =>
  new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).replace('.', '')

export const EVALUACIONES = {
  excelente: 'Excelente',
  bueno: 'Bueno',
  regular: 'Regular',
  deficiente: 'Deficiente',
}

export const FRECUENCIAS = {
  quincenal: 'Quincenal (15 días)',
  mensual: 'Mensual (30 días)',
}

export const COMIDAS = [
  ['desayuno', 'Desayuno'],
  ['almuerzo', 'Almuerzo'],
  ['cena', 'Cena'],
]
