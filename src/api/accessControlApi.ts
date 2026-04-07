import { http } from "./http";

export type AccessMode = "active" | "read-only" | "hidden";

export type AccessMatrix = Record<string, AccessMode>;
export type RoleMatrix = Record<string, Record<string, AccessMode>>;

export interface UserEntry {
  id: number;
  name: string;
  email: string;
  role: string;
  overrides: AccessMatrix;
}

export interface MeAccessControlResponse {
  role: string;
  version: number;
  matrix: AccessMatrix;
  overrides?: Record<string, AccessMode>;
}

export interface AccessControlMatrixResponse {
  version: number;
  matrix: RoleMatrix;
}

export interface SaveAccessControlMatrixPayload {
  matrix: RoleMatrix;
  version?: number;
}

export const accessControlApi = {
  async getMyAccessControl() {
    const { data } = await http.get<MeAccessControlResponse>("me/access-control");
    return data;
  },

  async getAccessMatrix() {
    const { data } = await http.get<AccessControlMatrixResponse>("settings/access-control");
    return data;
  },

  async saveAccessMatrix(payload: SaveAccessControlMatrixPayload) {
    const { data } = await http.post<{ ok: boolean; version: number; savedAt: string }>(
      "settings/access-control",
      payload,
    );
    return data;
  },

  /** List all users for admin management */
  async getUsersList(): Promise<{ items: UserEntry[] }> {
    const { data } = await http.get<{ items: UserEntry[] }>("settings/users");
    return data;
  },

  /** Save per-user overrides */
  async saveUserOverrides(userId: number, overrides: AccessMatrix): Promise<{ ok: boolean }> {
    const { data } = await http.put<{ ok: boolean }>(
      `settings/users/${userId}/overrides`,
      { overrides },
    );
    return data;
  },
};

