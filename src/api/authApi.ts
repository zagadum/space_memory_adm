import { http } from "./http";

export interface SignInDto { email: string; password: string }
export interface UserDto { id: string; email: string; name: string; role: string; initials: string }
export interface SignInResponse { token: string; user: UserDto }

function isNotFoundError(error: any): boolean {
  return Number(error?.response?.status) === 404;
}

export const authApi = {
  async signIn(dto: SignInDto) {
    try {
      const { data } = await http.post<SignInResponse>("auth/sign-in", dto);
      return data;
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
      const { data } = await http.post<SignInResponse>("v1/auth/sign-in", dto);
      return data;
    }
  },
  async me() {
    try {
      const { data } = await http.get<UserDto>("auth/me");
      return data;
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
      const { data } = await http.get<UserDto>("v1/auth/me");
      return data;
    }
  },
};
