import { http } from "./http";

export interface SignInDto { email: string; password: string }
export interface UserDto { id: string; email: string; name: string; role: string; initials: string; teacherId?: number; forcePasswordChange?: boolean }
export interface SignInResponse { token: string; user: UserDto }
export interface ChangePasswordDto { newPassword: string; currentPassword?: string }

export const authApi = {
  async signIn(dto: SignInDto) {
    const { data } = await http.post<SignInResponse>("auth/sign-in", dto);
    return data;
  },
  async me() {
    const { data } = await http.get<UserDto>("auth/me");
    return data;
  },
  async changePassword(dto: ChangePasswordDto) {
    const { data } = await http.post("auth/change-password", dto);
    return data;
  },
};
