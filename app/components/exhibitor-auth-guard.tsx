"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { tokenStore } from "@/app/modules/shared/auth/token"
import { isJwtExpired } from "@/app/modules/shared/auth/jwt"

import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

export function ExhibitorAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const token = tokenStore.get()

    if (!token) {
      tokenStore.remove()
      toast.warning({
        title: "Sessão expirada",
        subtitle: "Faça login novamente para continuar.",
        duration: 3500,
      })
      router.replace("/login")
      return
    }

    if (isJwtExpired(token)) {
      tokenStore.remove()
      toast.warning({
        title: "Sessão expirada",
        subtitle: "Seu acesso expirou. Faça login novamente.",
        duration: 3500,
      })
      router.replace("/login")
      return
    }

    setReady(true)
  }, [router, pathname])

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Spinner className="h-4 w-4" />
          Carregando
        </div>
      </div>
    )
  }

  return <>{children}</>
}
