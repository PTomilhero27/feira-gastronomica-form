import { z } from 'zod'

/**
 * Contrato do Profile (Portal do Expositor)
 *
 * GET /owners/me  -> ownerMeSchema (pode vir null no banco)
 * PATCH /owners/me -> updateOwnerMeSchema (NO PORTAL: nunca vazio)
 */

export const personTypeSchema = z.enum(['PF', 'PJ'])
export const bankAccountTypeSchema = z.enum(['CORRENTE', 'POUPANCA', 'PAGAMENTO'])

export function digitsOnly(value: string) {
  return (value ?? '').replace(/\D/g, '')
}

const requiredText = (label: string) =>
  z
    .string({ error: `${label} é obrigatório.` })
    .transform((v) => (v ?? '').trim())
    .refine((v) => v.length > 0, `${label} é obrigatório.`)

const requiredDigits = (label: string, min: number, max: number) =>
  z
    .string({ error: `${label} é obrigatório.` })
    .transform((v) => digitsOnly(v ?? ''))
    .refine((v) => v.length >= min && v.length <= max, `${label} inválido.`)

export const ownerMeSchema = z.object({
  id: z.string(),

  // Somente leitura
  personType: personTypeSchema,
  document: z.string(),
  email: z.string().nullable(),

  // Editáveis (podem vir null do banco)
  name: z.string().nullable(),
  phone: z.string().nullable(),
  stallsDescription: z.string().nullable(),

  // Endereço (Prisma atual)
  zipCode: z.string().nullable(),
  addressFull: z.string().nullable(),
  addressNumber: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),

  // Financeiro (Prisma atual)
  pixKey: z.string().nullable(),
  bankAccountType: bankAccountTypeSchema.nullable(),
  bankName: z.string().nullable(),
  bankAgency: z.string().nullable(),
  bankAccount: z.string().nullable(),
  bankHolderName: z.string().nullable(),
  bankHolderDocument: z.string().nullable(),
})

export type OwnerMe = z.infer<typeof ownerMeSchema>

/**
 * PATCH /owners/me
 * Regra do portal: NUNCA pode enviar vazio.
 * (Se o usuário apagar, vai invalidar e impedir salvar)
 */
export const updateOwnerMeSchema = z.object({
  // Básico
  name: requiredText('Nome / Razão social').refine((v) => v.length >= 2, 'Nome / Razão social está incompleto.'),
  phone: requiredDigits('Telefone', 10, 13),
  stallsDescription: requiredText('Descrição da operação'),

  // Endereço
  zipCode: requiredDigits('CEP', 8, 8),
  state: requiredText('UF')
    .transform((v) => v.toUpperCase())
    .refine((v) => /^[A-Z]{2}$/.test(v), 'UF inválida.'),
  city: requiredText('Cidade'),
  addressNumber: requiredText('Número'),
  addressFull: requiredText('Rua / Bairro (compacto)'),

  // Financeiro
  pixKey: requiredText('Chave Pix'),

  /**
   * Mantemos por compatibilidade, mas no Portal vamos sempre setar "CORRENTE" no submit
   */
  bankAccountType: bankAccountTypeSchema.optional(),

  bankName: requiredText('Banco'),
  bankAgency: requiredDigits('Agência', 3, 8),
  bankAccount: requiredDigits('Conta', 4, 20),

  bankHolderName: requiredText('Nome do titular'),
  bankHolderDocument: requiredDigits('Documento do titular', 11, 14).refine(
    (v) => v.length === 11 || v.length === 14,
    'Documento do titular inválido.',
  ),
})

export type UpdateOwnerMeRequest = z.infer<typeof updateOwnerMeSchema>
