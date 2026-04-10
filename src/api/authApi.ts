import { http } from "./http";
import { accessControlApi, type MeAccessControlResponse } from "./accessControlApi";

export interface SignInDto { email: string; password: string }
export interface UserDto { id: string; email: string; name: string; role: string; initials: string; teacherId?: number; forcePasswordChange?: boolean }
export interface SignInResponse { token: string; user: UserDto }
export interface ChangePasswordDto { newPassword: string; currentPassword?: string }

export interface SessionBootstrapResponse {
  user: UserDto;
  access: MeAccessControlResponse;
}

const SESSION_BOOTSTRAP_TTL_MS = 15000;

let sessionBootstrapPromise: Promise<SessionBootstrapResponse> | null = null;
let sessionBootstrapCache: { at: number; value: SessionBootstrapResponse } | null = null;

function withInitials(user: UserDto): UserDto {
  if (!user.initials && user.email) {
    return { ...user, initials: user.email.substring(0, 2).toUpperCase() };
  }
  return user;
}

export function clearSessionBootstrapCache() {
  sessionBootstrapPromise = null;
  sessionBootstrapCache = null;
}

export const authApi = {
  async signIn(dto: SignInDto) {
    const { data } = await http.post<SignInResponse>("auth/sign-in", dto);
    return data;
  },
  async me() {
    const { data } = await http.get<UserDto>("auth/me");
    return withInitials(data);
  },
  async getSessionBootstrap(force = false): Promise<SessionBootstrapResponse> {
    const now = Date.now();
    if (!force && sessionBootstrapCache && now - sessionBootstrapCache.at < SESSION_BOOTSTRAP_TTL_MS) {
      return sessionBootstrapCache.value;
    }

    if (sessionBootstrapPromise) {
      return sessionBootstrapPromise;
    }

    sessionBootstrapPromise = Promise.all([authApi.me(), accessControlApi.getMyAccessControl()])
      .then(([user, access]) => {
        const value = { user, access };
        sessionBootstrapCache = { at: Date.now(), value };
        return value;
      })
      .finally(() => {
        sessionBootstrapPromise = null;
      });

    return sessionBootstrapPromise;
  },
  async changePassword(dto: ChangePasswordDto) {
    const { data } = await http.post("auth/change-password", dto);
    return data;
  },
};
