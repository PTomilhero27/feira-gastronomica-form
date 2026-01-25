import { InterestForm } from "@/modules/interests/components/interest-form";

/**
 * Página pública: Interessados.
 * Responsabilidade:
 * - Expor um cadastro simples de interesse (Owner básico)
 * - Permitir editar cadastro existente via CPF/CNPJ
 *
 * Observação:
 * - Não cria barraca
 * - Não escolhe feira
 */
export default function InteressadosPage() {
  return <InterestForm />
}
