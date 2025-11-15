import { ApiClient } from "@/lib/apiClient";
import type { PaginatedResult } from "@/types/common";
import type { SubjectEntity } from "@/types/subject";

export interface SubjectFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateSubjectData {
  name: string;
  code: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateSubjectData {
  name?: string;
  code?: string;
  description?: string | null;
  isActive?: boolean;
}

class SubjectService extends ApiClient {
  list(params?: SubjectFilters) {
    return this.get<PaginatedResult<SubjectEntity>>("/subject", params);
  }

  getById(id: string) {
    return this.get<SubjectEntity>(`/subject/${id}`);
  }

  create(data: CreateSubjectData) {
    return this.post<SubjectEntity>("/subject", data);
  }

  update(id: string, data: UpdateSubjectData) {
    return this.put<SubjectEntity>(`/subject/${id}`, data);
  }

  deleteSubject(id: string) {
    return this.delete<void>(`/subject/${id}`);
  }
}

export const subjectService = new SubjectService();
