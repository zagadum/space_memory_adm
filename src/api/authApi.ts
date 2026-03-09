import { http } from "./http";

export interface SignInDto { email: string; password: string }
export interface UserDto { id: string; email: string; name: string; role: string; initials: string }
export interface SignInResponse { token: string; user: UserDto }

export const authApi = {
  async signIn(dto: SignInDto) {
    const { data } = await http.post<SignInResponse>("/v1/auth/sign-in", dto);
    return data;
  },
  async me() {
    const { data } = await http.get<UserDto>("/v1/auth/me");
    return data;
  },
};
