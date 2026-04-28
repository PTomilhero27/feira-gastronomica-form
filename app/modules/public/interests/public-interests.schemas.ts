import { z } from "zod";
import { onlyDigits } from "../../shared/utils/document";

/**
 * Schemas do cadastro público de interessados.
 *
 * Responsabilidade:
 * - Validar payload do cadastro (com senha)
 * - Validar verificação de email (código 6 dígitos)
 * - Validar reenvio de código
 *
 * Decisão:
 * - password com mín. 6 caracteres (alinhado ao backend)
 * - confirmPassword validado aqui no frontend (não vai para o backend)
 */

export const personTypeSchema = z.enum(["PF", "PJ"]);

/**
 * Payload do cadastro de interessado SEM senha.
 * Usado em /cadastro (demonstrar interesse).
 */
export const publicInterestSimpleCreateSchema = z.object({
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

export type PublicInterestSimpleCreateRequest = z.infer<
  typeof publicInterestSimpleCreateSchema
>;

/**
 * Payload do cadastro COM senha.
 * Usado em /criar-conta (criar conta de usuário).
 */
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
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
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
 * Response do cadastro.
 * Backend retorna ownerId + message sobre o código enviado.
 */
export const publicInterestCreateResponseSchema = z.object({
  ownerId: z.string(),
  message: z.string().optional(),
});

export type PublicInterestCreateResponse = z.infer<
  typeof publicInterestCreateResponseSchema
>;

/**
 * Shape típico de erro do Nest:
 * { statusCode: 400, message: string | string[], error: "Bad Request" }
 */
export const nestErrorSchema = z.object({
  statusCode: z.number().optional(),
  message: z.union([z.string(), z.array(z.string())]).optional(),
  error: z.string().optional(),
});

export type NestError = z.infer<typeof nestErrorSchema>;

// ──────────────────────────────────────────────
// Verificação de email (código 6 dígitos)
// ──────────────────────────────────────────────

export const verifyEmailSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  code: z
    .string()
    .length(6, "O código deve ter 6 dígitos.")
    .regex(/^\d{6}$/, "O código deve conter apenas números."),
});

export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;

export const verifyEmailResponseSchema = z.object({
  success: z.boolean(),
});

export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>;

// ──────────────────────────────────────────────
// Reenvio de código
// ──────────────────────────────────────────────

export const resendVerificationSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
});

export type ResendVerificationRequest = z.infer<typeof resendVerificationSchema>;
