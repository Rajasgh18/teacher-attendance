import type {
  ClassEntity,
  ClassFilters,
  CreateClassData,
  UpdateClassData,
  ClassStudentsFilters,
  ClassTeacherAssignment,
} from "@/types/class";
import { ApiClient } from "@/lib/apiClient";
import type { StudentEntity } from "@/types/student";
import type { PaginatedResult } from "@/types/common";

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
