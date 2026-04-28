import type { Metadata } from 'next'

/**
 * Layout da rota /feiras/futuras/[fairId] (PÚBLICA).
 */
export const metadata: Metadata = {
  title: 'Detalhes da Feira | Feira Gastronômica',
  description: 'Veja todos os detalhes, benefícios e espaços disponíveis desta feira.',
}

export default function FairDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
