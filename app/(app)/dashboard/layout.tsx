// app/(app)/dashboard/layout.tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Portal do Expositor",
  description: "Atalhos rápidos para as áreas principais do portal do expositor.",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
