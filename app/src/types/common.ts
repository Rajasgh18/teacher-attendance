export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
