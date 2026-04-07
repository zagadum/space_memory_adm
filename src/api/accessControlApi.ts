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

function isNotFoundError(error: any): boolean {
  return Number(error?.response?.status) === 404;
}

export const accessControlApi = {
  async getMyAccessControl() {
    try {
      const { data } = await http.get<MeAccessControlResponse>("me/access-control");
      return data;
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
      const { data } = await http.get<MeAccessControlResponse>("v1/me/access-control");
      return data;
    }
  },

  async getAccessMatrix() {
    try {
      const { data } = await http.get<AccessControlMatrixResponse>("settings/access-control");
      return data;
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
      const { data } = await http.get<AccessControlMatrixResponse>("v1/settings/access-control");
      return data;
    }
  },

  async saveAccessMatrix(payload: SaveAccessControlMatrixPayload) {
    try {
      const { data } = await http.post<{ ok: boolean; version: number; savedAt: string }>(
        "settings/access-control",
        payload,
      );
      return data;
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
      const { data } = await http.post<{ ok: boolean; version: number; savedAt: string }>(
        "v1/settings/access-control",
        payload,
      );
      return data;
    }
  },

  /** List all users for admin management */
  async getUsersList(): Promise<{ items: UserEntry[] }> {
    try {
      const { data } = await http.get<{ items: UserEntry[] }>("settings/users");
      return data;
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
      const { data } = await http.get<{ items: UserEntry[] }>("v1/settings/users");
      return data;
    }
  },

  /** Save per-user overrides */
  async saveUserOverrides(userId: number, overrides: AccessMatrix): Promise<{ ok: boolean }> {
    try {
      const { data } = await http.put<{ ok: boolean }>(
        `settings/users/${userId}/overrides`,
        { overrides },
      );
      return data;
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
      const { data } = await http.put<{ ok: boolean }>(
        `v1/settings/users/${userId}/overrides`,
        { overrides },
      );
      return data;
    }
  },
};

