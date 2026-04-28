import { useMutation } from "@tanstack/react-query";
import {
  createPublicInterest,
  verifyEmail,
  resendVerification,
} from "./public-interests.service";
import type {
  PublicInterestCreateRequest,
  PublicInterestSimpleCreateRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
} from "./public-interests.schemas";

/**
 * Mutation do cadastro público (fluxo completo COM senha).
 * Usada em /criar-conta.
 */
export function useCreatePublicInterestMutation() {
  return useMutation({
    mutationKey: ["public-interests-create"],
    mutationFn: (input: PublicInterestCreateRequest) => createPublicInterest(input),
  });
}

/**
 * Mutation do cadastro simples SEM senha (demonstrar interesse).
 * Usada em /cadastro.
 */
export function useCreatePublicInterestSimpleMutation() {
  return useMutation({
    mutationKey: ["public-interests-simple-create"],
    mutationFn: (input: PublicInterestSimpleCreateRequest) => createPublicInterest(input as any),
  });
}

/**
 * Mutation de verificação de email (código 6 dígitos).
 */
export function useVerifyEmailMutation() {
  return useMutation({
    mutationKey: ["public-interests-verify-email"],
    mutationFn: (input: VerifyEmailRequest) => verifyEmail(input),
  });
}

/**
 * Mutation de reenvio de código de verificação.
 */
export function useResendVerificationMutation() {
  return useMutation({
    mutationKey: ["public-interests-resend"],
    mutationFn: (input: ResendVerificationRequest) => resendVerification(input),
  });
}
