"use client"

/**
 * AuthProvider do Portal do Expositor.
 *
 * Responsabilidade:
 * - Guardar accessToken e owner logado
 * - Expor métodos login/logout
 *
 * Decisão:
 * - Token em localStorage (MVP). No futuro: refresh token/httpOnly.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ExhibitorOwner } from "@/app/modules/exhibitor-auth/exhibitor-auth.schemas"

type AuthState = {
  token: string | null
  owner: ExhibitorOwner | null
  isReady: boolean
  isAuthenticated: boolean
  setSession: (token: string, owner: ExhibitorOwner) => void
  clearSession: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export const STORAGE_KEY = "exhibitor.portal.token"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [owner, setOwner] = useState<ExhibitorOwner | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Carrega token salvo (MVP)
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    setToken(saved)
    setIsReady(true)

    // Observação:
    // - Aqui poderíamos chamar /exhibitor-auth/me se necessário.
    // - Por enquanto o login já devolve owner e a gente mantém em memória.
  }, [])

  const value = useMemo<AuthState>(() => {
    return {
      token,
      owner,
      isReady,
      isAuthenticated: Boolean(token),
      setSession: (t, o) => {
        setToken(t)
        setOwner(o)
        localStorage.setItem(STORAGE_KEY, t)
      },
      clearSession: () => {
        setToken(null)
        setOwner(null)
        localStorage.removeItem(STORAGE_KEY)
      },
    }
  }, [token, owner, isReady])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider />")
  return ctx
}
