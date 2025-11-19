import type {
  AttendanceFilters,
  TeacherAttendanceEntity,
  StudentAttendanceEntity,
} from "@/types/attendance";
import { ApiClient } from "@/lib/apiClient";
import type { PaginatedResult } from "@/types/common";

class AttendanceService extends ApiClient {
  listTeacher(params?: AttendanceFilters) {
    return this.get<PaginatedResult<TeacherAttendanceEntity>>(
      "/attendance/teacher",
      params
    );
  }
  listStudent(params?: AttendanceFilters) {
    return this.get<PaginatedResult<StudentAttendanceEntity>>(
      "/attendance/student",
      params
    );
  }

  getByAttendanceId(id: string, type: "teacher" | "student") {
    if (type === "teacher")
      return this.get<TeacherAttendanceEntity>(`/attendance/${id}?type=teacher`);

    return this.get<StudentAttendanceEntity>(`/attendance/${id}?type=student`);
  }

  getByTeacherId(id: string) {
    return this.get<TeacherAttendanceEntity[]>(`/attendance/teacher/${id}`);
  }
  getByStudentId(id: string) {
    return this.get<StudentAttendanceEntity[]>(`/attendance/student/${id}`);
  }

  deleteStudentAttendance(id: string) {
    return this.delete<void>(`/attendance/student/${id}`);
  }
}

export const attendanceService = new AttendanceService();
