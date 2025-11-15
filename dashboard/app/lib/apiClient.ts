// API Configuration

let baseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

interface CustomRequestConfig<T> {
  url: string;
  method: string;
  params?: Record<string, any>;
  data?: T;
  headers?: Record<string, string>;
  credentials?: "include" | "omit" | "same-origin";
}

interface ApiResponse<T> {
  status?: "success" | "error";
  success?: boolean;
  data: T;
  error?: string;
  message?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = baseUrl;
  }

  protected async request<T>(config: CustomRequestConfig<T>): Promise<T> {
    const {
      url,
      method,
      params,
      data,
      headers: customHeaders,
      credentials,
    } = config;

    const fullUrl = new URL(`${this.baseUrl}${url}`);
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        // Only append if value is not undefined, null, or empty string
        if (value !== undefined && value !== null && value !== "") {
          fullUrl.searchParams.append(key, String(value));
        }
      });
    }

    const headers = new Headers(customHeaders || {});

    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (credentials) {
      options.credentials = credentials;
    }

    if (data) {
      if (data instanceof FormData) {
        options.body = data;
        // Let browser set content-type for FormData
        headers.delete("Content-Type");
      } else {
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }
        options.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(fullUrl.toString(), options);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        let errorMessage = "An error occurred";
        if (errorData) {
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (typeof errorData === "string") {
            errorMessage = errorData;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        }
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).response = response;
        throw error;
      }

      const responseData: ApiResponse<T> = await response.json();

      const isSuccess =
        responseData.status === "success" || responseData.success === true;

      if (isSuccess || responseData.data !== undefined) {
        return responseData.data;
      }

      const errorMessage =
        responseData.error || responseData.message || "An error occurred";
      throw new Error(errorMessage);
    } catch (error: any) {
      if (error.status) {
        // rethrow custom error
        throw error;
      }
      // Network error or other fetch-related error
      const enhancedError = new Error(
        error.message || "A network error occurred."
      );
      throw enhancedError;
    }
  }

  // GET request
  protected async get<T>(
    url: string,
    params?: Record<string, any>,
    credentials?: "include" | "omit" | "same-origin"
  ): Promise<T> {
    return this.request({
      method: "GET",
      url,
      params,
      credentials,
    });
  }

  // POST request
  protected async post<T>(
    url: string,
    data?: any,
    credentials?: "include" | "omit" | "same-origin"
  ): Promise<T> {
    return this.request<T>({
      method: "POST",
      url,
      data,
      credentials,
    });
  }

  // PUT request
  protected async put<T>(
    url: string,
    data?: any,
    credentials?: "include" | "omit" | "same-origin"
  ): Promise<T> {
    return this.request<T>({
      method: "PUT",
      url,
      data,
      credentials,
    });
  }

  // DELETE request
  protected async delete<T>(
    url: string,
    data?: any,
    credentials?: "include" | "omit" | "same-origin"
  ): Promise<T> {
    return this.request<T>({
      method: "DELETE",
      url,
      data,
      credentials,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
