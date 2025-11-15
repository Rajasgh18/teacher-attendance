import { ApiClient } from "@/lib/apiClient";
import type { PaginatedResult } from "@/types/common";
import type {
  ClassEntity,
  ClassTeacherAssignment,
} from "@/types/class";
import type { StudentEntity } from "@/types/student";

export interface ClassFilters {
  page?: number;
  limit?: number;
  search?: string;
  schoolId?: string;
}

export interface ClassStudentsFilters {
  classId?: string;
  schoolId?: string;
}

export interface CreateClassData {
  schoolId: string;
  name: string;
  grade: string;
  section?: string;
  academicYear: string;
  isActive?: boolean;
}

export interface UpdateClassData {
  name?: string;
  grade?: string;
  section?: string;
  academicYear?: string;
  isActive?: boolean;
}

class ClassService extends ApiClient {
  list(params?: ClassFilters) {
    return this.get<PaginatedResult<ClassEntity>>("/class", params);
  }

  getById(id: string) {
    return this.get<ClassEntity>(`/class/${id}`);
  }

  create(data: CreateClassData) {
    return this.post<ClassEntity>("/class", data);
  }

  update(id: string, data: UpdateClassData) {
    return this.put<ClassEntity>(`/class/${id}`, data);
  }

  deleteClass(id: string) {
    return this.delete<void>(`/class/${id}`);
  }

  getStudents(params: ClassStudentsFilters) {
    return this.get<StudentEntity[]>("/class/students", params);
  }

  getTeachers(params: ClassStudentsFilters) {
    return this.get<ClassTeacherAssignment[]>("/class/teachers", params);
  }
}

export const classService = new ClassService();

