"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LayoutGrid, ChevronDown, LogOut } from "lucide-react"

import { ExhibitorAuthGuard } from "./exhibitor-auth-guard"
import { useAuth } from "@/app/providers/auth-provider"
import { profileService } from "@/app/modules/profile/profile.service"
import type { OwnerMe } from "@/app/modules/profile/profile.schema"
import { toast } from "@/components/ui/toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const BREADCRUMB_MAP: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/barracas": "Barracas",
  "/feiras": "Feiras ativas",
  "/feiras/futuras": "Feiras futuras",
  "/perfil": "Perfil",
  "/financeiro": "Financeiro",
  "/ajuda": "Ajuda",
}

export function ExhibitorAppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { clearSession, owner } = useAuth()
  const [me, setMe] = React.useState<OwnerMe | null>(null)

  React.useEffect(() => {
    profileService.getMe().then(setMe).catch(console.error)
  }, [])

  const missingFieldsCount = React.useMemo(() => {
    if (!me) return 0;
    const requiredKeys: (keyof OwnerMe)[] = [
      'name', 'phone', 'stallsDescription', 'zipCode', 'state', 'city', 
      'addressNumber', 'addressFull', 'pixKey', 'bankName', 'bankAgency', 
      'bankAccount', 'bankHolderName', 'bankHolderDocument'
    ];
    let count = 0;
    for (const key of requiredKeys) {
      const val = me[key];
      if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
        count++;
      }
    }
    return count;
  }, [me])

  // Find exact match or fallback to closest
  const currentTitle =
    BREADCRUMB_MAP[pathname] ||
    Object.entries(BREADCRUMB_MAP).find(([path]) => pathname.startsWith(path) && path !== "/")?.[1] ||
    "Portal do Expositor"

  function handleLogout() {
    clearSession()
    toast.success({
      title: "Logout realizado",
      subtitle: "Até a próxima 👋",
      duration: 2500,
    })
    router.replace("/login")
  }

  const displayName = me?.name || owner?.fullName
  const displayEmail = me?.email || owner?.email

  const userInitials = displayName
    ? displayName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "EX"

  return (
    <ExhibitorAuthGuard>
      <div className="min-h-screen bg-[#f8fafc]">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
            
            {/* Left side: Breadcrumb like Admin Panel */}
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 rounded-[12px] bg-[#010077] px-4 py-2 text-white hover:bg-[#010077]/90 transition-colors">
                <LayoutGrid className="h-4 w-4" />
                <span className="text-sm font-semibold">Painel</span>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-semibold text-[#010077]">{currentTitle}</span>
            </div>

            {/* Right side: User Profile Pill */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-1.5 pr-4 transition-colors hover:bg-slate-100 focus:outline-none">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#010077] text-xs font-bold text-white">
                  {userInitials}
                  {missingFieldsCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                    </span>
                  )}
                </div>
                <div className="hidden flex-col items-start sm:flex">
                  <span className="text-sm font-bold text-[#010077]">
                    {displayName || "Expositor"}
                  </span>
                  <span className="text-xs text-[#010077]/70">
                    {displayEmail || "acesso@expositor.com"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-[#010077]/50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-xl">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/perfil" className="flex cursor-pointer items-center justify-between">
                    <span>Perfil e dados</span>
                    {missingFieldsCount > 0 && (
                      <span 
                        title="Você possui informações pendentes de preenchimento em seu perfil."
                        className="flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600 ring-1 ring-inset ring-red-500/20"
                      >
                        <span className="relative mr-1.5 flex h-2 w-2">
                          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                        </span>
                        {missingFieldsCount} pendente{missingFieldsCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair do painel</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </ExhibitorAuthGuard>
  )
}

