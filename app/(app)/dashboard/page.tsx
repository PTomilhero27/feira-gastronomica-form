import { DashboardCards } from "./components/dashboards-cards"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atalhos rápidos para as áreas principais do portal.
        </p>
      </div>

      <DashboardCards />
    </div>
  )
}
