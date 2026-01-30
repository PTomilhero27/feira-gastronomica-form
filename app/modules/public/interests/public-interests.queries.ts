import { useMutation } from "@tanstack/react-query";
import { createPublicInterest } from "./public-interests.service";
import type { PublicInterestCreateRequest } from "./public-interests.schemas";

/**
 * Mutation do cadastro público.
 *
 * Decisão:
 * - useMutation porque é ação (submit)
 * - mutationKey fixa para facilitar debug e tracking
 */
export function useCreatePublicInterestMutation() {
  return useMutation({
    mutationKey: ["public-interests-create"],
    mutationFn: (input: PublicInterestCreateRequest) => createPublicInterest(input),
  });
}
