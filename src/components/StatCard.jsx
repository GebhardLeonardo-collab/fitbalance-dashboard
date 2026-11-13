export default function StatCard({ titulo, valor, icono: Icono, destacada = false }) {
  return (
    <div className={`p-5 shadow-lg ${
      destacada
        ? 'bg-gradient-to-r from-navy-900 to-navy-600 text-white'
        : 'bg-white text-navy-900'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-base">{titulo}</p>
        {destacada ? (
          <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0">
            <Icono size={15} className="text-navy-800" />
          </span>
        ) : (
          <Icono size={22} className="text-accent shrink-0" />
        )}
      </div>
      <p className="text-4xl font-light">{valor}</p>
    </div>
  )
}