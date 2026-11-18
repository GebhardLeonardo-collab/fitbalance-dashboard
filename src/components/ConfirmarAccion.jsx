import Modal from './Modal'

export default function ConfirmarAccion({ titulo, mensaje, textoConfirmar, advertencia = false, enviando, onConfirmar, onCerrar }) {
  return (
    <Modal idTitulo="confirmar-titulo" idMensaje="confirmar-mensaje" bloqueado={enviando} onCerrar={onCerrar}>
      <h2 id="confirmar-titulo" className="text-lg font-semibold text-navy-900 mb-2">
        {titulo}
      </h2>
      <p id="confirmar-mensaje" className="text-sm text-slate-600 mb-6">
        {mensaje}
      </p>

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
          onClick={onConfirmar}
          className={`${
            advertencia ? 'bg-red-600 hover:bg-red-700' : 'bg-accent hover:bg-accent-light'
          } disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 transition-colors`}
        >
          {enviando ? 'Procesando...' : textoConfirmar}
        </button>
      </div>
    </Modal>
  )
}
