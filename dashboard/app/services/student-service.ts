import { ApiClient } from "@/lib/apiClient";
import type { PaginatedResult } from "@/types/common";
import type { StudentEntity } from "@/types/student";

export interface StudentFilters {
  page?: number;
  limit?: number;
  search?: string;
  classId?: string;
  schoolId?: string;
}

export interface CreateStudentData {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  classId: string;
  schoolId: string;
  isActive?: boolean;
}

export interface UpdateStudentData {
  studentId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  schoolId?: string;
  gender?: "male" | "female" | "other";
  classId?: string;
  isActive?: boolean;
}

class StudentService extends ApiClient {
  list(params?: StudentFilters) {
    return this.get<PaginatedResult<StudentEntity>>("/student", params);
  }

  getById(id: string) {
    return this.get<StudentEntity>(`/student/${id}`);
  }

  create(data: CreateStudentData) {
    return this.post<StudentEntity>("/student", data);
  }

  update(id: string, data: UpdateStudentData) {
    return this.put<StudentEntity>(`/student/${id}`, data);
  }

  deleteStudent(id: string) {
    return this.delete(`/student/${id}`);
  }
}

export const studentService = new StudentService();
