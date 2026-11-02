import { createApiClient, readJson, record } from "./apiClient.ts";
import { RepositoryError } from "./guideRepository.ts";

export interface StaffUser {
  username: string;
  isStaff: true;
}
function staff(value: unknown): StaffUser {
  if (!record(value) || typeof value.username !== "string" || value.isStaff !== true) {
    throw new RepositoryError("unauthorized", "Este acceso está reservado al personal autorizado.", 403);
  }
  return { username: value.username, isStaff: true };
}
export function createAuthClient(fetchImpl?: typeof fetch) {
  const api = createApiClient(fetchImpl);
  return {
    async me() {
      return staff(await readJson(await api.request("/api/v1/auth/me/")));
    },
    async login(username: string, password: string) {
      await api.write("/api/v1/auth/login/", "POST", { username, password });
      // Only the server session check authorizes entering the panel.
      return this.me();
    },
    async logout() {
      await api.write("/api/v1/auth/logout/", "POST");
    },
  };
}
export const authClient = createAuthClient();
