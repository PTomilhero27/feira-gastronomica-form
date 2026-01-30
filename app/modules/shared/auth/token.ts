import { STORAGE_KEY } from "@/app/providers/auth-provider";

/**
 * Centraliza o acesso ao token do client.
 * Mantém o resto do código desacoplado de "localStorage".
 */
export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  },
  set(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, token);
  },
  remove() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  },
};
