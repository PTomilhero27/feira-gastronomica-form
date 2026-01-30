import { z } from "zod";
import { onlyDigits } from "../../shared/utils/document";

/**
 * Schemas do cadastro público de interessados.
 *
 * Responsabilidade:
 * - Validar payload do cadastro inicial
 * - Validar shape de erro conhecido (NestJS)
 *
 * Decisão:
 * - Mantemos tudo no schema (sem types separados) para seguir seu padrão.
 */

export const personTypeSchema = z.enum(["PF", "PJ"]);

export const publicInterestCreateSchema = z.object({
  personType: personTypeSchema,
  document: z
    .string()
    .min(11, "Informe um CPF/CNPJ válido.")
    .refine((v) => {
      const d = onlyDigits(v);
      return d.length === 11 || d.length === 14;
    }, "Informe um CPF (11) ou CNPJ (14)."),
  fullName: z.string().min(2, "Informe seu nome / razão social."),
  email: z.string().email("Informe um e-mail válido."),
  phone: z.string().min(8, "Informe um telefone válido."),
  stallsDescription: z
    .string()
    .min(10, "Descreva brevemente sua operação (mín. 10 caracteres).")
    .optional()
    .nullable(),
});

export type PublicInterestCreateRequest = z.infer<
  typeof publicInterestCreateSchema
>;

/**
 * Response mínima do backend (para confirmação de envio).
 */
export const publicInterestCreateResponseSchema = z.object({
  ownerId: z.string(),
});

export type PublicInterestCreateResponse = z.infer<
  typeof publicInterestCreateResponseSchema
>;

/**
 * Shape típico de erro do Nest:
 * { statusCode: 400, message: string | string[], error: "Bad Request" }
 *
 * Observação:
 * - Mantemos flexível para não quebrar caso a mensagem venha em array.
 */
export const nestErrorSchema = z.object({
  statusCode: z.number().optional(),
  message: z.union([z.string(), z.array(z.string())]).optional(),
  error: z.string().optional(),
});

export type NestError = z.infer<typeof nestErrorSchema>;
