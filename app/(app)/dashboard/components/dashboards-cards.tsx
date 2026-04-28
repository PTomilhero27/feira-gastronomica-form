"use client"

import { LayoutGrid, Store, Sparkles } from "lucide-react"
import { useMyFairsQuery } from "@/app/modules/exhibitor-fairs/exhibitor-fairs.queries"

import { DashboardCard } from "./dashboard-card"
import { UpcomingFairsBanner, FutureFairsCardBadge } from "./upcoming-fairs-banner"

export function DashboardCards() {
  const { data: myFairsData } = useMyFairsQuery()

  const activeCount = myFairsData?.items?.filter((f) => f.fairStatus === "ATIVA").length ?? 0

  return (
    <div className="flex flex-col gap-6">
      {/* Banner mobile (hidden on md+) */}
      <UpcomingFairsBanner />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          title="Feiras"
          subtitle="Acesse rapidamente as feiras que você participa e acompanhe o status"
          icon={<Store className="h-5 w-5" />}
          href="/feiras"
          accent="green"
          category="Módulo principal"
          actionText="Escolher feira ativa"
          badge={activeCount > 0 ? `${activeCount} ativa${activeCount > 1 ? "s" : ""}` : undefined}
        />

        <DashboardCard
          title="Barracas"
          subtitle="Controle suas barracas, produtos e informações vinculadas"
          icon={<LayoutGrid className="h-5 w-5" />}
          href="/barracas"
          accent="blue"
          category="Operação"
          actionText="Gerenciar barracas"
        />

        <DashboardCard
          title="Futuras Feiras"
          subtitle="Conteúdo público, demonstração de interesse e vagas disponíveis"
          icon={<Sparkles className="h-5 w-5" />}
          href="/feiras/futuras"
          accent="pink"
          category="Oportunidades"
          actionText="Ver vitrine"
          target="_blank"
          extraContent={<FutureFairsCardBadge />}
        />
      </div>
    </div>
  )
}
