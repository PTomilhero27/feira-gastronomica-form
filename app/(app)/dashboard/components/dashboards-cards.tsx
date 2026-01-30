"use client"

import { LayoutGrid, Store, RefreshCcw, CalendarDays, Wallet } from "lucide-react"

import { DashboardCard } from "./dashboard-card"

export function DashboardCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <DashboardCard
        title="Cadastro de barracas"
        subtitle="Gerencie suas barracas e produtos"
        icon={<Store className="h-5 w-5" />}
        href="/barracas"
        accent="blue"
      />

      <DashboardCard
        title="Atualização de cadastro"
        subtitle="Dados pessoais, contato e bancário"
        icon={<RefreshCcw className="h-5 w-5" />}
        href="/perfil"
        accent="purple"
      />

      <DashboardCard
        title="Feiras ativas"
        subtitle="Acompanhe suas feiras e pendências"
        icon={<CalendarDays className="h-5 w-5" />}
        href="/feiras"
        accent="green"
      />

      <DashboardCard
        title="Financeiro"
        subtitle="Cobranças, repasses e extratos"
        icon={<Wallet className="h-5 w-5" />}
        href="/financeiro"
        accent="orange"
        disabled
        badge="Em breve"
      />

      <DashboardCard
        title="Área do expositor"
        subtitle="Recursos e orientações"
        icon={<LayoutGrid className="h-5 w-5" />}
        href="/ajuda"
        accent="slate"
        disabled
        badge="Em breve"
      />
    </div>
  )
}
