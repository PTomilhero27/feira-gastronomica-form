/**
 * Página pública de ativação/redefinição via token.
 *
 * Responsabilidade:
 * - Ler token via querystring (?token=...)
 * - Renderizar o fluxo correto (card) e mensagens de erro amigáveis
 *
 * Decisão:
 * - Esta é uma exceção pública no Portal do Expositor.
 * - No futuro, apenas fluxo de "cadastro de interessado" e "ativar/reset por token" ficam públicos.
 */
import { ActivateAccountCard } from "./components/activate-account-card"

type PageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function ActivatePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const token = sp?.token?.trim() ?? ""

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-lg">
        <div className="w-full space-y-3 rounded-2xl border bg-card p-6">
          <div className="text-lg font-semibold">Link inválido</div>
          <div className="text-sm text-muted-foreground">
            Este link não contém token. Solicite um novo link para a equipe responsável.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <ActivateAccountCard token={token} />
    </div>
  )
}
