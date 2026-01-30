// app/(app)/barracas/nova/page.tsx

import { StallCreatePage } from "./components/stall-create-page";

/**
 * Página (conteúdo) da rota /barracas/nova.
 *
 * Responsabilidade:
 * - Renderizar o componente client com wizard de criação.
 */
export default function NewStallPage() {
  return <StallCreatePage />
}
