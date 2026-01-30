/**
 * Página (Server Component) responsável por expor a rota /perfil no portal autenticado.
 * Mantemos a lógica real em um componente Client (ProfilePage) para usar hooks (TanStack Query + RHF).
 */

import { ProfilePage } from "./components/profile-page";

export const metadata = {
  title: "Meu perfil",
};

export default function Page() {
  return <ProfilePage />;
}
