"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ExhibitorAuthGuard } from "./exhibitor-auth-guard"

import { tokenStore } from "@/app/modules/shared/auth/token"
import { toast } from "@/components/ui/toast"

export function ExhibitorAppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  function handleLogout() {
    tokenStore.remove()
    toast.success({
      title: "Logout realizado",
      subtitle: "Até a próxima 👋",
      duration: 2500,
    })
    router.replace("/login")
  }

  return (
    <ExhibitorAuthGuard>
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <div className="text-sm font-semibold">Portal do Expositor</div>

            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </div>
    </ExhibitorAuthGuard>
  )
}
