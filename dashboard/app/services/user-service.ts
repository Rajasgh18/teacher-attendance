import { ApiClient } from "@/lib/apiClient";
import type { PaginatedResult } from "@/types/common";
import type { User, UserRole } from "@/types/auth";

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | "teacher" | "admin" | "principal";
  department?: string;
  schoolId?: string;
  isActive?: boolean;
}

interface UserStats {
  totalUsers: number;
  totalTeachers: number;
  totalAdmins: number;
}

export interface CreateTeacherData {
  schoolId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "admin" | "teacher";
  employeeId: string;
  department: string;
  phone: string;
  address: string;
  hireDate: string;
  isActive?: boolean;
}

export interface UpdateTeacherData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: "admin" | "teacher";
  employeeId?: string;
  department?: string;
  phone?: string;
  address?: string;
  hireDate?: string;
  isActive?: boolean;
}

class UserService extends ApiClient {
  getAll(params?: UserFilters) {
    return this.get<PaginatedResult<User>>("/user", params);
  }

  getTeachers(params?: UserFilters) {
    return this.get<PaginatedResult<User>>("/user/teachers", params);
  }

  getById(id: string) {
    return this.get<User>(`/user/${id}`);
  }

  create(data: CreateTeacherData) {
    return this.post<User>("/user", data);
  }

  update(id: string, data: UpdateTeacherData) {
    return this.put<User>(`/user/${id}`, data);
  }

  deleteUser(id: string) {
    return this.delete<void>(`/user/${id}`);
  }

  getStats() {
    return this.get<UserStats>("/user/stats");
  }
}

export const userService = new UserService();
