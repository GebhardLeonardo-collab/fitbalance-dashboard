import { createContext, useContext } from 'react'

export const SesionContext = createContext(null)

export const useSesion = () => useContext(SesionContext)

export const INICIO_POR_ROL = { admin: '/', gym: '/', nutricionista: '/', cliente: '/' }
