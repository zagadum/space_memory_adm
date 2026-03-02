import { http } from "./http";

export interface SignInDto { email: string; password: string }
export interface SignInResponse { token: string; user: { id: string; email: string; name: string } }

export const authApi = {
  async signIn(dto: SignInDto) {
    const { data } = await http.post<SignInResponse>("api/auth/sign-in", dto);
    return data;
  },
  async me() {
    const { data } = await http.get<{ id: string; email: string; name: string }>("api/auth/me");
    return data;
  },
};
