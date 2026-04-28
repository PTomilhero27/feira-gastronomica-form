import { api } from "../../shared/http/api";
import { onlyDigits } from "../../shared/utils/document";
import {
  nestErrorSchema,
  publicInterestCreateResponseSchema,
  verifyEmailResponseSchema,
  type PublicInterestCreateRequest,
  type PublicInterestCreateResponse,
  type VerifyEmailRequest,
  type VerifyEmailResponse,
  type ResendVerificationRequest,
} from "./public-interests.schemas";

/**
 * Erro tipado para a UI.
 */
export class PublicInterestCreateError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "PublicInterestCreateError";
  }
}

/**
 * Cadastro público (Owner + User + envio de código de verificação).
 * POST /public/interests/upsert
 */
export async function createPublicInterest(
  payload: PublicInterestCreateRequest,
): Promise<PublicInterestCreateResponse> {
  const normalized = {
    ...payload,
    document: onlyDigits(payload.document),
    phone: onlyDigits(payload.phone),
    email: payload.email.trim().toLowerCase(),
    fullName: payload.fullName.trim(),
    stallsDescription: payload.stallsDescription?.trim() || null,
  };

  try {
    const json = await api.post("public/interests/upsert", normalized);
    return publicInterestCreateResponseSchema.parse(json);
  } catch (err: any) {
    const status = err?.status ?? err?.response?.status;
    const rawData = err?.data ?? err?.response?.data;
    const parsed = rawData ? nestErrorSchema.safeParse(rawData) : null;

    let message = "Não foi possível enviar seu cadastro agora.";

    if (parsed?.success) {
      const m = parsed.data.message;
      if (Array.isArray(m)) message = m.join(" ");
      else if (typeof m === "string") message = m;
    }

    throw new PublicInterestCreateError(message, status);
  }
}

/**
 * Verificar email com código de 6 dígitos.
 * POST /public/interests/verify-email
 */
export async function verifyEmail(
  payload: VerifyEmailRequest,
): Promise<VerifyEmailResponse> {
  const json = await api.post("public/interests/verify-email", {
    email: payload.email.trim().toLowerCase(),
    code: payload.code.trim(),
  });
  return verifyEmailResponseSchema.parse(json);
}

/**
 * Reenviar código de verificação.
 * POST /public/interests/resend-verification
 */
export async function resendVerification(
  payload: ResendVerificationRequest,
): Promise<{ message: string }> {
  return await api.post("public/interests/resend-verification", {
    email: payload.email.trim().toLowerCase(),
  });
}
