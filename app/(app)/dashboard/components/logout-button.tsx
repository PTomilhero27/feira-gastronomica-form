"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { tokenStore } from "@/app/modules/shared/auth/token"
import { toast } from "@/components/ui/toast"

export function LogoutButton() {
  const router = useRouter()

  function handleLogout() {
    tokenStore.remove()
    toast.success({ title: "Logout realizado", subtitle: "Até a próxima 👋", duration: 2500 })
    router.replace("/login")
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
      <LogOut className="h-4 w-4" />
      Sair
    </Button>
  )
}
