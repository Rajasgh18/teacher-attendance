export type UserRole = "admin" | "principal" | "teacher";

export interface SchoolSummary {
  id: string;
  name: string;
  code?: string;
  address?: string;
  city?: string;
}

export interface User {
  id: string;
  email: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  schoolId: string | null;
  school?: SchoolSummary | null;
  createdAt?: string;
  updatedAt?: string;
  department?: string | null;
  phone?: string | null;
  address?: string | null;
  hireDate?: string | null;
  isActive?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  employeeId: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshResponse {
  tokens: AuthTokens;
}

export interface ProfileResponse {
  user: User;
}
