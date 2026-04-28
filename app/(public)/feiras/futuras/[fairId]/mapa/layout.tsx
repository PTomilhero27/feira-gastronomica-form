import type { Metadata } from 'next'

/**
 * Layout da rota /feiras/futuras/[fairId]/mapa (PÚBLICA).
 */
export const metadata: Metadata = {
  title: 'Mapa da Feira | Feira Gastronômica',
  description: 'Mapa interativo com espaços disponíveis. Selecione e demonstre interesse.',
}

export default function FairMapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
