// app/(app)/perfil/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Meu perfil | Portal do Expositor',
  description:
    'Atualize seus dados cadastrais, endereço e informações financeiras do expositor.',
  robots: { index: false, follow: false },
}

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
