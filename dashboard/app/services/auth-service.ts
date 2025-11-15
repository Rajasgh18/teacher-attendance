import { ApiClient } from "@/lib/apiClient";
import type {
  LoginPayload,
  LoginResponse,
  ProfileResponse,
  RefreshResponse,
} from "@/types/auth";

class AuthService extends ApiClient {
  login(payload: LoginPayload) {
    return this.post<LoginResponse>("/auth/login", payload);
  }

  refreshToken(refreshToken: string) {
    return this.post<RefreshResponse>("/auth/refresh", { refreshToken });
  }

  getProfile() {
    return this.get<ProfileResponse>("/auth/me");
  }

  logout() {
    return this.post<null>("/auth/logout");
  }
}

export const authService = new AuthService();