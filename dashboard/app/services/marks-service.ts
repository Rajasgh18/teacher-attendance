import type { MarksEntity, MarksFilters } from "@/types/marks";
import { ApiClient } from "@/lib/apiClient";
import type { PaginatedResult } from "@/types/common";

class MarksService extends ApiClient {
  list(params?: MarksFilters) {
    return this.get<PaginatedResult<MarksEntity>>("/subject/marks", params);
  }

  getById(id: string) {
    return this.get<MarksEntity>(`/subject/marks/${id}`);
  }

  deleteMark(id: string) {
    return this.delete<void>(`/subject/marks/${id}`);
  }
}

export const marksService = new MarksService();
