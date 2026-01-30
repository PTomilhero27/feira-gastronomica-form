import { api } from "../../shared/http/api";
import { onlyDigits } from "../../shared/utils/document";
import {
  nestErrorSchema,
  publicInterestCreateResponseSchema,
  type PublicInterestCreateRequest,
  type PublicInterestCreateResponse,
} from "./public-interests.schemas";

/**
 * Erro tipado para a UI.
 *
 * Responsabilidade:
 * - Padronizar mensagem que será exibida no formulário (toast / inline)
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
 * Service do cadastro público de interessados.
 *
 * Responsabilidade:
 * - Chamar POST /public/interests/upsert
 * - Normalizar payload (digitsOnly)
 * - Interpretar erro de "documento já cadastrado" e devolver mensagem amigável
 *
 * Observação:
 * - Nosso wrapper `api` retorna JSON em sucesso.
 * - Em erro, dependendo do wrapper, pode lançar exceção. Por isso tratamos defensivamente.
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
    /**
     * Tratamento defensivo:
     * - Se o wrapper api expõe "status" e "data", tentamos extrair.
     * - Se não expõe, mostramos uma mensagem genérica.
     */
    const status = err?.status ?? err?.response?.status;

    const rawData = err?.data ?? err?.response?.data;
    const parsed = rawData ? nestErrorSchema.safeParse(rawData) : null;

    let message = "Não foi possível enviar seu cadastro agora.";

    if (parsed?.success) {
      const m = parsed.data.message;
      if (Array.isArray(m)) message = m.join(" ");
      else if (typeof m === "string") message = m;
    }

    // ✅ Caso específico esperado: documento já cadastrado (400)
    if (status === 400 && message) {
      throw new PublicInterestCreateError(message, status);
    }

    throw new PublicInterestCreateError(message, status);
  }
}
