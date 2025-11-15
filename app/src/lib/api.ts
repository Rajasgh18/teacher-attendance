import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  AuthTokens,
  LoginRequest,
  AuthResponse,
  RegisterRequest,
} from "@/types/auth";
import {
  User,
  Class,
  Marks,
  Subject,
  Teacher,
  Student,
  UserStats,
  ClassStats,
  SearchParams,
  UserResponse,
  DashboardStats,
  TeacherWithUser,
  StudentWithClass,
  TeacherAssignment,
  TeacherAttendance,
  StudentAttendance,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
  CreateClassRequest,
  UpdateClassRequest,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  CreateStudentRequest,
  UpdateStudentRequest,
  ChangePasswordRequest,
  UpdatePasswordRequest,
  AssignTeacherToClassRequest,
  UpdateTeacherAttendanceRequest,
  CreateStudentAttendanceRequest,
  UpdateStudentAttendanceRequest,
  RemoveTeacherFromClassRequest,
} from "@/types";
import { API_BASE_URL } from "@/constants/api";

// Generic response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

// Error types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Request configuration
export interface RequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

// API client class
class ApiClient {
  private baseURL: string;
  private defaultTimeout: number = 10000; // 10 seconds

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Get authentication token
  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem("access_token");
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  // Build URL with query parameters
  private buildURL(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    // Ensure endpoint starts with / if it doesn't already
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    // Construct the full URL
    let fullUrl = `${this.baseURL}${cleanEndpoint}`;

    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      fullUrl += `?${searchParams.toString()}`;
    }

    return fullUrl;
  }

  // Make HTTP request with optional retry logic
  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<T> {
    const { method = "GET", headers = {}, body, params } = config;

    const url = this.buildURL(endpoint, params);
    const token = await this.getAuthToken();

    try {
      // Prepare request config
      const requestConfig: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };

      if (token) {
        requestConfig.headers = {
          ...requestConfig.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      if (body && method !== "GET") {
        requestConfig.body = JSON.stringify(body);
      }
      const response = await fetch(url, requestConfig);
      // Handle HTTP errors
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorData: any = null;

        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || errorMessage;
          errorData = errorResponse.data;
        } catch (error) {
          console.error("error", error);
          // If error response is not JSON, use default message
        }

        throw new ApiError(response.status, errorMessage, errorData);
      }

      const data: ApiResponse<T> = await response.json();
      return data.data as T;
    } catch (error) {
      console.error("error", error);
      throw error;
    }
  }

  // Generic request methods
  async get<T>(
    endpoint: string,
    config?: Omit<RequestConfig, "method" | "body">,
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: "GET",
    });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    config?: Omit<RequestConfig, "method">,
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: "POST",
      body,
    });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    config?: Omit<RequestConfig, "method">,
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: "PUT",
      body,
    });
  }

  async patch<T>(
    endpoint: string,
    body?: any,
    config?: Omit<RequestConfig, "method">,
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: "PATCH",
      body,
    });
  }

  async delete<T>(
    endpoint: string,
    config?: Omit<RequestConfig, "method" | "body">,
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: "DELETE",
    });
  }

  // Paginated request helper
  async getPaginated<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 10,
    config?: Omit<RequestConfig, "method" | "body">,
  ): Promise<PaginatedResponse<T>> {
    return this.makeRequest<PaginatedResponse<T>>(endpoint, {
      ...config,
      method: "GET",
      params: { page, limit },
    });
  }
}

// Create and export API client instance
export const api = new ApiClient(API_BASE_URL);

// Common API endpoints
export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },
  users: {
    list: "/user",
    all: "/user/all",
    stats: "/user/stats",
    search: "/user/search",
    profile: "/user/profile",
    // Teacher-specific endpoints
    teachers: "/user/teachers",
    teachersByDepartment: (department: string) =>
      `/user/teachers/department/${department}`,
    teacherByEmployeeId: (employeeId: string) =>
      `/user/teachers/employee/${employeeId}`,
    getTeacherAssignments: "/user/assignments",
    teacherClasses: `/user/classes`,
    teacherSubjects: (teacherId: string) =>
      `/user/teachers/${teacherId}/subjects`,
    assignTeacherToClass: "/user/teachers/assign",
    removeTeacherFromClass: "/user/teachers/remove",
    byRole: (role: string) => `/user/role/${role}`,
    byEmail: (email: string) => `/user/email/${email}`,
    get: (id: string) => `/user/${id}`,
    create: "/user",
    update: (id: string) => `/user/${id}`,
    updatePassword: (id: string) => `/user/${id}/password`,
    changePassword: (id: string) => `/user/${id}/change-password`,
    delete: (id: string) => `/user/${id}`,
    pushLiveLocation: "/user/live-location",
  },
  subjects: {
    list: "/subject",
    active: "/subject/active",
    get: (id: string) => `/subject/${id}`,
    getMarks: (id: string) => `/subject/${id}/marks`,
    byCode: (code: string) => `/subject/code/${code}`,
    byField: (field: string) => `/subject/field/${field}`,
    create: "/subject",
    update: (id: string) => `/subject/${id}`,
    delete: (id: string) => `/subject/${id}`,
    hardDelete: (id: string) => `/subject/${id}/hard`,
  },
  teachers: {
    list: "/teacher",
    get: (id: string) => `/teacher/${id}`,
    byEmployeeId: (employeeId: string) => `/teacher/employee/${employeeId}`,
    byDepartment: (department: string) => `/teacher/department/${department}`,
    assignments: (teacherId: string) => `/teacher/${teacherId}/assignments`,
    profile: "/teacher/profile",
    create: "/teacher",
    update: (id: string) => `/teacher/${id}`,
    delete: (id: string) => `/teacher/${id}`,
    assignToClass: "/teacher/assign-class",
    removeFromClass: "/teacher/remove-class",
  },
  classes: {
    list: "/class",
    active: "/class/active",
    get: (id: string) => `/class/${id}`,
    byGrade: (grade: string) => `/class/grade/${grade}`,
    byAcademicYear: (academicYear: string) =>
      `/class/academic-year/${academicYear}`,
    byNameAndGrade: (name: string, grade: string) =>
      `/class/name/${name}/grade/${grade}`,
    students: (classId: string) => `/class/${classId}/students`,
    teachers: (classId: string) => `/class/${classId}/teachers`,
    stats: (classId: string) => `/class/${classId}/stats`,
    create: "/class",
    update: (id: string) => `/class/${id}`,
    delete: (id: string) => `/class/${id}`,
  },
  students: {
    list: "/student",
    active: "/student/active",
    get: (id: string) => `/student/${id}`,
    byStudentId: (studentId: string) => `/student/student/${studentId}`,
    byClass: `/class/students`,
    attendance: (studentId: string) => `/student/${studentId}/attendance`,
    create: "/student",
    update: (id: string) => `/student/${id}`,
    delete: (id: string) => `/student/${id}`,
  },
  attendance: {
    teacher: {
      list: "/attendance/teacher",
      get: (id: string) => `/attendance/teacher/${id}`,
      byTeacher: (teacherId: string) => `/attendance/teacher/${teacherId}`,
      byDate: (date: string) => `/attendance/date/${date}`,
      update: (id: string) => `/attendance/teacher/${id}`,
      delete: (id: string) => `/attendance/teacher/${id}`,
    },
    student: {
      list: "/attendance/student",
      get: (id: string) => `/attendance/student/${id}`,
      byStudent: (studentId: string) => `/attendance/student/${studentId}`,
      byClass: (classId: string) => `/attendance/student/class/${classId}`,
      byDate: (date: string) => `/attendance/student/date/${date}`,
      create: "/attendance/student",
      update: (id: string) => `/attendance/student/${id}`,
      delete: (id: string) => `/attendance/student/${id}`,
    },
  },
  reports: {
    summary: "/reports/summary",
    teacher: (teacherId: string) => `/reports/teacher/${teacherId}`,
    dateRange: "/reports/date-range",
  },
  resync: {
    teacher: "/attendance/teacher/bulk",
    student: "/attendance/student/bulk",
    marks: "/subject/marks/bulk",
  },
} as const;

// Type-safe API functions
export const authApi = {
  login: (credentials: LoginRequest) =>
    api.post<AuthResponse>(endpoints.auth.login, credentials),

  register: (userData: RegisterRequest) =>
    api.post<AuthResponse>(endpoints.auth.register, userData),

  logout: () => api.post<void>(endpoints.auth.logout),

  refresh: () => api.post<AuthTokens>(endpoints.auth.refresh),

  me: () => api.get<UserResponse>(endpoints.auth.me),
};

export const usersApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    department?: string;
    schoolId?: string;
    isActive?: boolean;
  }) =>
    api.getPaginated<User>(endpoints.users.list, params?.page, params?.limit, {
      params,
    }),

  all: () => api.get<User[]>(endpoints.users.all),

  stats: () => api.get<UserStats>(endpoints.users.stats),

  search: (params: SearchParams) =>
    api.get<User[]>(endpoints.users.search, {
      params: params as Record<string, string | number | boolean>,
    }),

  profile: () => api.get<User>(endpoints.users.profile),

  // Teacher-specific endpoints
  teachers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    isActive?: boolean;
  }) =>
    api.getPaginated<Teacher>(
      endpoints.users.teachers,
      params?.page,
      params?.limit,
      {
        params,
      },
    ),

  teachersByDepartment: (department: string) =>
    api.get<Teacher[]>(endpoints.users.teachersByDepartment(department)),

  teacherByEmployeeId: (employeeId: string) =>
    api.get<Teacher>(endpoints.users.teacherByEmployeeId(employeeId)),

  getTeacherAssignments: () =>
    api.get<TeacherAssignment[]>(endpoints.users.getTeacherAssignments),

  teacherClasses: () => api.get<Class[]>(endpoints.users.teacherClasses),
  teacherSubjects: (teacherId: string) =>
    api.get<Subject[]>(endpoints.users.teacherSubjects(teacherId)),

  assignTeacherToClass: (assignmentData: AssignTeacherToClassRequest) =>
    api.post<TeacherAssignment>(
      endpoints.users.assignTeacherToClass,
      assignmentData,
    ),

  removeTeacherFromClass: (assignmentData: RemoveTeacherFromClassRequest) =>
    api.post<void>(endpoints.users.removeTeacherFromClass, assignmentData),

  byRole: (role: string) => api.get<User[]>(endpoints.users.byRole(role)),

  byEmail: (email: string) => api.get<User>(endpoints.users.byEmail(email)),

  get: (id: string) => api.get<User>(endpoints.users.get(id)),

  create: (userData: CreateUserRequest) =>
    api.post<User>(endpoints.users.create, userData),

  createTeacher: (teacherData: CreateTeacherRequest) =>
    api.post<Teacher>(endpoints.users.create, teacherData),

  update: (id: string, userData: UpdateUserRequest) =>
    api.put<User>(endpoints.users.update(id), userData),

  updateTeacher: (id: string, teacherData: UpdateTeacherRequest) =>
    api.put<Teacher>(endpoints.users.update(id), teacherData),

  updatePassword: (id: string, passwordData: UpdatePasswordRequest) =>
    api.put<void>(endpoints.users.updatePassword(id), passwordData),

  changePassword: (id: string, passwordData: ChangePasswordRequest) =>
    api.put<void>(endpoints.users.changePassword(id), passwordData),

  delete: (id: string) => api.delete<void>(endpoints.users.delete(id)),

  pushLiveLocation: (latitude: number, longitude: number) =>
    api.post<void>(endpoints.users.pushLiveLocation, { latitude, longitude }),
};

export const resyncApi = {
  teacher: (
    bulkData: Omit<TeacherAttendance, "id" | "createdAt" | "updatedAt">[],
  ) => api.post<void>(endpoints.resync.teacher, bulkData),

  student: (
    bulkData: Omit<StudentAttendance, "id" | "createdAt" | "updatedAt">[],
  ) => api.post<void>(endpoints.resync.student, bulkData),

  marks: (bulkData: {
    marksData: Omit<Marks, "id" | "createdAt" | "updatedAt">[];
  }) => api.post<void>(endpoints.resync.marks, bulkData),
};

export const subjectsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) =>
    api.getPaginated<Subject>(
      endpoints.subjects.list,
      params?.page,
      params?.limit,
      { params },
    ),

  active: () => api.get<Subject[]>(endpoints.subjects.active),

  get: (id: string) => api.get<Subject>(endpoints.subjects.get(id)),

  getMarks: (id: string) => api.get<Marks[]>(endpoints.subjects.getMarks(id)),

  byCode: (code: string) => api.get<Subject>(endpoints.subjects.byCode(code)),

  byField: (field: string) =>
    api.get<Subject[]>(endpoints.subjects.byField(field)),

  delete: (id: string) => api.delete<void>(endpoints.subjects.delete(id)),

  hardDelete: (id: string) =>
    api.delete<void>(endpoints.subjects.hardDelete(id)),
};

export const teachersApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    schoolId?: string;
    isActive?: boolean;
  }) =>
    api.getPaginated<TeacherWithUser>(
      endpoints.teachers.list,
      params?.page,
      params?.limit,
      { params },
    ),

  get: (id: string) => api.get<TeacherWithUser>(endpoints.teachers.get(id)),

  byEmployeeId: (employeeId: string) =>
    api.get<TeacherWithUser>(endpoints.teachers.byEmployeeId(employeeId)),

  byDepartment: (department: string) =>
    api.get<TeacherWithUser[]>(endpoints.teachers.byDepartment(department)),

  assignments: (teacherId: string) =>
    api.get<TeacherAssignment[]>(endpoints.teachers.assignments(teacherId)),

  profile: () => api.get<TeacherWithUser>(endpoints.teachers.profile),

  create: (teacherData: CreateTeacherRequest) =>
    api.post<Teacher>(endpoints.teachers.create, teacherData),

  update: (id: string, teacherData: UpdateTeacherRequest) =>
    api.put<Teacher>(endpoints.teachers.update(id), teacherData),

  delete: (id: string) => api.delete<void>(endpoints.teachers.delete(id)),

  assignToClass: (assignmentData: AssignTeacherToClassRequest) =>
    api.post<TeacherAssignment>(
      endpoints.teachers.assignToClass,
      assignmentData,
    ),

  removeFromClass: (assignmentData: RemoveTeacherFromClassRequest) =>
    api.post<void>(endpoints.teachers.removeFromClass, assignmentData),
};

export const classesApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    schoolId?: string;
  }) =>
    api.getPaginated<Class>(
      endpoints.classes.list,
      params?.page,
      params?.limit,
      { params },
    ),

  get: (id: string) => api.get<Class>(endpoints.classes.get(id)),

  students: (classId: string) =>
    api.get<Student[]>(endpoints.classes.students(classId)),

  teachers: (classId: string) =>
    api.get<TeacherAssignment[]>(endpoints.classes.teachers(classId)),

  stats: (classId: string) =>
    api.get<ClassStats>(endpoints.classes.stats(classId)),

  create: (classData: CreateClassRequest) =>
    api.post<Class>(endpoints.classes.create, classData),

  update: (id: string, classData: UpdateClassRequest) =>
    api.put<Class>(endpoints.classes.update(id), classData),

  delete: (id: string) => api.delete<void>(endpoints.classes.delete(id)),
};

export const studentsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    classId?: string;
    schoolId?: string;
  }) =>
    api.getPaginated<StudentWithClass>(
      endpoints.students.list,
      params?.page,
      params?.limit,
      { params },
    ),

  active: () => api.get<StudentWithClass[]>(endpoints.students.active),

  get: (id: string) => api.get<StudentWithClass>(endpoints.students.get(id)),

  byStudentId: (studentId: string) =>
    api.get<StudentWithClass>(endpoints.students.byStudentId(studentId)),

  byClassOrSchool: (params?: { classId?: string; schoolId?: string }) =>
    api.get<Student[]>(endpoints.students.byClass, { params }),

  attendance: (
    studentId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      classId?: string;
    },
  ) =>
    api.get<StudentAttendance[]>(endpoints.students.attendance(studentId), {
      params,
    }),

  create: (studentData: CreateStudentRequest) =>
    api.post<Student>(endpoints.students.create, studentData),

  update: (id: string, studentData: UpdateStudentRequest) =>
    api.put<Student>(endpoints.students.update(id), studentData),

  delete: (id: string) => api.delete<void>(endpoints.students.delete(id)),
};

export const attendanceApi = {
  teacher: {
    list: (params?: {
      page?: number;
      limit?: number;
      teacherId?: string;
      date?: string;
    }) =>
      api.getPaginated<TeacherAttendance>(
        endpoints.attendance.teacher.list,
        params?.page,
        params?.limit,
        { params },
      ),

    get: (id: string) =>
      api.get<TeacherAttendance>(endpoints.attendance.teacher.get(id)),

    byTeacher: (teacherId: string) =>
      api.get<TeacherAttendance[]>(
        endpoints.attendance.teacher.byTeacher(teacherId),
      ),

    byDate: (date: string) =>
      api.get<TeacherAttendance[]>(endpoints.attendance.teacher.byDate(date)),

    update: (id: string, attendanceData: UpdateTeacherAttendanceRequest) =>
      api.put<TeacherAttendance>(
        endpoints.attendance.teacher.update(id),
        attendanceData,
      ),

    delete: (id: string) =>
      api.delete<void>(endpoints.attendance.teacher.delete(id)),
  },
  student: {
    list: (params?: {
      page?: number;
      limit?: number;
      studentId?: string;
      classId?: string;
      date?: string;
    }) =>
      api.getPaginated<StudentAttendance>(
        endpoints.attendance.student.list,
        params?.page,
        params?.limit,
        { params },
      ),

    get: (id: string) =>
      api.get<StudentAttendance>(endpoints.attendance.student.get(id)),

    byStudent: (studentId: string) =>
      api.get<StudentAttendance[]>(
        endpoints.attendance.student.byStudent(studentId),
      ),

    byClass: (classId: string) =>
      api.get<StudentAttendance[]>(
        endpoints.attendance.student.byClass(classId),
      ),

    byDate: (date: string) =>
      api.get<StudentAttendance[]>(endpoints.attendance.student.byDate(date)),

    create: (attendanceData: CreateStudentAttendanceRequest) =>
      api.post<StudentAttendance>(
        endpoints.attendance.student.create,
        attendanceData,
      ),

    update: (id: string, attendanceData: UpdateStudentAttendanceRequest) =>
      api.put<StudentAttendance>(
        endpoints.attendance.student.update(id),
        attendanceData,
      ),

    delete: (id: string) =>
      api.delete<void>(endpoints.attendance.student.delete(id)),
  },
};

export const reportsApi = {
  summary: (params?: { startDate?: string; endDate?: string }) =>
    api.get<DashboardStats>(endpoints.reports.summary, { params }),

  teacher: (
    teacherId: string,
    params?: { startDate?: string; endDate?: string },
  ) =>
    api.get<TeacherAttendance[]>(endpoints.reports.teacher(teacherId), {
      params,
    }),

  dateRange: (params: { startDate: string; endDate: string }) =>
    api.get<TeacherAttendance[]>(endpoints.reports.dateRange, { params }),
};

// Utility functions
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};
