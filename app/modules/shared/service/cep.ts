/**
 * Busca endereço por CEP (ViaCEP).
 * Responsabilidade:
 * - Facilitar autopreenchimento do Step de Endereço
 *
 * Observação:
 * - Não depende do backend (ótimo pro forms público)
 */
export async function fetchAddressByCep(cep: string) {
  const digits = cep.replace(/\D/g, '')
  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
  const json = await res.json()

  if (!res.ok || json?.erro) {
    throw new Error('CEP não encontrado.')
  }

  return {
    city: json.localidade as string,
    state: json.uf as string,
    street: json.logradouro as string,
    neighborhood: json.bairro as string,
  }
}
