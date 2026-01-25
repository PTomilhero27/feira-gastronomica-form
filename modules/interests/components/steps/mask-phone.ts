import { onlyDigits } from "@/modules/shared/utils/document";

/**
 * Máscara simples BR para telefone:
 * - 11 dígitos: (11) 99999-9999
 * - 10 dígitos: (11) 9999-9999
 *
 * Observação:
 * - Aqui é UI/UX. A validação forte deve ficar no Zod também.
 */
export function maskPhoneBR(value: string) {
  const d = onlyDigits(value).slice(0, 11);

  if (d.length <= 2) return d;
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);

  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  if (rest.length <= 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}
