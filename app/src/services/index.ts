// Export all services
export { default as AuthService } from "./auth";
export { default as UsersService } from "./users";
export { default as ClassesService } from "./classes";
export { default as StudentsService } from "./students";
export { default as DashboardService } from "./dashboard";
export { default as AttendanceService } from "./attendance";
export { default as DataSyncService } from "./dataSyncService";

// Export offline-first services
export { syncService } from "./syncService";
export { DatabaseService } from "./databaseService";
export { MarksService } from "./marks";
export { SubjectsService } from "./subjects";

// Export types from the main types file
export type {
  User,
  Class,
  Teacher,
  Student,
  UserRole,
  UserStats,
  ClassStats,
  ApiResponse,
  SearchParams,
  DashboardStats,
  UserListParams,
  ClassListParams,
  ClassWithDetails,
  StudentWithClass,
  AttendanceStatus,
  CreateUserRequest,
  UpdateUserRequest,
  TeacherListParams,
  StudentListParams,
  TeacherAttendance,
  PaginatedResponse,
  StudentAttendance,
  CreateClassRequest,
  UpdateClassRequest,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  CreateStudentRequest,
  UpdateStudentRequest,
  TeacherDashboardData,
  ChangePasswordRequest,
  UpdatePasswordRequest,
  TeacherAttendanceListParams,
  StudentAttendanceListParams,
  CreateTeacherAttendanceRequest,
  UpdateTeacherAttendanceRequest,
  CreateStudentAttendanceRequest,
  UpdateStudentAttendanceRequest,
} from "@/types";
