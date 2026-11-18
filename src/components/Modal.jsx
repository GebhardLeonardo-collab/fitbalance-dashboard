import { useEffect, useRef } from 'react'

const SELECTOR_FOCO = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'

export default function Modal({ idTitulo, idMensaje, bloqueado, onCerrar, ancho = 'max-w-md', children }) {
  const dialogo = useRef(null)

  useEffect(() => {
    const anterior = document.activeElement
    const inicial = dialogo.current?.querySelector('[data-foco-inicial]') ?? dialogo.current?.querySelector(SELECTOR_FOCO)
    inicial?.focus()
    return () => anterior?.focus?.()
  }, [])

  useEffect(() => {
    function alPulsar(evento) {
      if (evento.key === 'Escape' && !bloqueado) {
        onCerrar()
        return
      }
      if (evento.key !== 'Tab') return
      const elementos = dialogo.current?.querySelectorAll(SELECTOR_FOCO)
      if (!elementos || elementos.length === 0) {
        evento.preventDefault()
        return
      }
      const primero = elementos[0]
      const ultimo = elementos[elementos.length - 1]
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener('keydown', alPulsar)
    return () => document.removeEventListener('keydown', alPulsar)
  }, [bloqueado, onCerrar])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 px-4"
      onClick={() => {
        if (!bloqueado) onCerrar()
      }}
    >
      <div
        ref={dialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={idMensaje}
        onClick={(evento) => evento.stopPropagation()}
        className={`w-full ${ancho} max-h-[90vh] overflow-y-auto bg-white p-6 shadow-xl`}
      >
        {children}
      </div>
    </div>
  )
}
