import { z } from 'zod'
import { onlyDigits } from '@/modules/shared/utils/document'

export const personTypeSchema = z.enum(['PF', 'PJ'])

export const interestOwnerFormSchema = z.object({
  personType: personTypeSchema,
  document: z
    .string()
    .min(11, 'Informe um CPF/CNPJ válido.')
    .refine((v) => {
      const d = onlyDigits(v)
      return d.length === 11 || d.length === 14
    }, 'Informe um CPF (11) ou CNPJ (14).'),
  fullName: z.string().min(2, 'Informe seu nome / razão social.'),

  email: z.string().email('Informe um e-mail válido.'),
  phone: z.string().min(8, 'Informe um telefone válido.'),

  addressFull: z.string().min(5, 'Informe o endereço completo.'),
  addressCity: z.string().min(2, 'Informe a cidade.'),
  addressState: z.string().min(2, 'Informe o estado.'),
  addressZipcode: z.string().min(8, 'Informe o CEP.'),

  pixKey: z.string().min(3, 'Informe sua chave Pix.'),
  bankName: z.string().min(2, 'Informe o banco.'),
  bankAgency: z.string().min(1, 'Informe a agência.'),
  bankAccount: z.string().min(1, 'Informe a conta.'),
  bankAccountType: z.enum(['CORRENTE', 'POUPANCA', 'PAGAMENTO']),
  bankHolderDoc: z.string().min(11, 'Informe o CPF/CNPJ do titular.'),
  bankHolderName: z.string().min(2, 'Informe o nome do titular.'),

  stallsDescription: z
    .string()
    .min(10, 'Descreva brevemente suas barracas (ex.: nomes e o que vende).'),
})

export type InterestOwnerForm = z.infer<typeof interestOwnerFormSchema>

/**
 * Request de upsert do Owner no Form 1.
 * Decisão:
 * - Reaproveitamos o schema do form, evitando divergência de contrato.
 */
export const ownerUpsertRequestSchema = interestOwnerFormSchema
export type OwnerUpsertRequest = z.infer<typeof ownerUpsertRequestSchema>

/**
 * Lookup por documento.
 * Observação:
 * - Mesmo que o backend hoje devolva só parte dos campos, deixamos opcionais
 *   para não quebrar o parse enquanto evoluímos a API.
 */
export const ownerLookupResponseSchema = z.object({
  found: z.boolean(),
  owner: z
    .object({
      id: z.string(),
      personType: personTypeSchema,
      document: z.string(),
      fullName: z.string(),
      email: z.string(),
      phone: z.string(),

      addressFull: z.string().optional().nullable(),
      addressCity: z.string().optional().nullable(),
      addressState: z.string().optional().nullable(),
      addressZipcode: z.string().optional().nullable(),

      bankName: z.string().optional().nullable(),
      bankAgency: z.string().optional().nullable(),
      bankAccount: z.string().optional().nullable(),
      bankAccountType: z.enum(['CORRENTE', 'POUPANCA', 'PAGAMENTO']).optional().nullable(),
      bankHolderDoc: z.string().optional().nullable(),
      bankHolderName: z.string().optional().nullable(),
      pixKey: z.string().optional().nullable(),

      stallsDescription: z.string().optional().nullable(),
    })
    .nullable(),
})

export type OwnerLookupResponse = z.infer<typeof ownerLookupResponseSchema>
