import { ZodError } from 'zod'

const FIELD_LABELS: Record<string, string> = {
  name: 'Nome / Razão social',
  phone: 'Telefone',
  stallsDescription: 'Descrição da operação',
  zipCode: 'CEP',
  addressFull: 'Rua / Bairro (compacto)',
  addressNumber: 'Número',
  city: 'Cidade',
  state: 'UF',
  pixKey: 'Chave Pix',
  bankName: 'Banco',
  bankAgency: 'Agência',
  bankAccount: 'Conta',
  bankHolderName: 'Nome do titular',
  bankHolderDocument: 'Documento do titular',
}

export function formatZodError(err: unknown) {
  if (!(err instanceof ZodError)) {
    return {
      title: 'Erro ao salvar',
      message: 'Revise os campos do formulário.',
    }
  }

  const messages = err.issues.map((issue) => {
    const field = String(issue.path?.[0] ?? '')
    const label = FIELD_LABELS[field] ?? field

    switch (issue.code) {
      case 'invalid_type':
        return `${label} é obrigatório.`
      case 'too_small':
        return `${label} está incompleto.`
      case 'custom':
      default:
        return issue.message || `${label} inválido.`
    }
  })

  const compact = messages.slice(0, 4).join(' ')
  return {
    title: 'Campos obrigatórios pendentes',
    message: compact + (messages.length > 4 ? ' …' : ''),
  }
}
