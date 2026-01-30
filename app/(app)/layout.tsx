import type { Metadata } from "next"
import { ExhibitorAppShell } from "../components/exhibitor-app-shell"

export const metadata: Metadata = {
  title: "Portal do Expositor",
  description: "Área do expositor para gestão de feiras, barracas e financeiro.",
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ExhibitorAppShell>{children}</ExhibitorAppShell>
}
