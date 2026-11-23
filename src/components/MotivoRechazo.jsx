import { useState } from 'react'
import Modal from './Modal'

const MAXIMO = 300

export default function MotivoRechazo({ nombre, enviando, onConfirmar, onCerrar }) {
  const [motivo, setMotivo] = useState('')

  return (
    <Modal idTitulo="rechazo-titulo" idMensaje="rechazo-mensaje" bloqueado={enviando} onCerrar={onCerrar}>
      <h2 id="rechazo-titulo" className="text-lg font-semibold text-navy-900 mb-2">
        ¿Rechazar la solicitud de {nombre}?
      </h2>
      <p id="rechazo-mensaje" className="text-sm text-slate-600 mb-4">
        La persona verá el motivo al intentar iniciar sesión. Más adelante podrás aprobar la solicitud si cambias de decisión.
      </p>

      <label className="flex flex-col gap-1 text-sm text-navy-900 mb-6">
        Motivo (opcional)
        <textarea
          rows={4}
          maxLength={MAXIMO}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className="border border-slate-300 px-3 py-2 text-sm font-normal focus:outline-none focus:border-accent"
        />
        <span className="text-xs text-slate-500 font-normal self-end">
          {motivo.length}/{MAXIMO}
        </span>
      </label>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          data-foco-inicial
          type="button"
          disabled={enviando}
          onClick={onCerrar}
          className="border border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white disabled:opacity-50 text-sm font-semibold px-4 py-2 transition-colors"
        >
          Volver
        </button>
        <button
          type="button"
          disabled={enviando}
          onClick={() => onConfirmar(motivo.trim())}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          {enviando ? 'Procesando...' : 'Sí, rechazar'}
        </button>
      </div>
    </Modal>
  )
}
