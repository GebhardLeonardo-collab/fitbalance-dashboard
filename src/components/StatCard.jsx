import CountUp from './CountUp'
import GlareHover from './GlareHover'

const DEGRADADO_NAVY = 'linear-gradient(to right in oklab, var(--color-navy-900), var(--color-navy-600))'

export default function StatCard({ titulo, valor, icono: Icono, destacada = false }) {
  const brillo = destacada
    ? {}
    : { glareColor: 'var(--color-accent)', blendMode: 'multiply' }

  return (
    <GlareHover
      width="100%"
      borderRadius={0}
      background={destacada ? DEGRADADO_NAVY : '#ffffff'}
      style={{ display: 'grid', placeItems: 'stretch', borderWidth: 0 }}
      className={`p-5 shadow-lg ${destacada ? 'text-white' : 'text-navy-900'}`}
      {...brillo}
    >
      <div>
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
        <p className="text-4xl font-light">
          <CountUp to={valor} separator="." />
        </p>
      </div>
    </GlareHover>
  )
}
