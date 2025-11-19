import { ApiClient } from "@/lib/apiClient";
import type { SchoolEntity } from "@/types/school";
import type { PaginatedResult } from "@/types/common";

export interface SchoolFilters {
  page?: number;
  limit?: number;
  search?: string;
  schoolId?: string;
}

class SchoolService extends ApiClient {
  list(params?: SchoolFilters) {
    return this.get<PaginatedResult<SchoolEntity>>("/schools", params);
  }
}

export const schoolService = new SchoolService();
