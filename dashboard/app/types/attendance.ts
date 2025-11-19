import type { User } from "./auth";
import type { StudentEntity } from "./student";
import type { SubjectEntity } from "./subject";

export interface TeacherAttendanceEntity {
  id: string;
  teacherId: string;
  latitude: number;
  longitude: number;
  checkIn: boolean;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  teacher: User;
}
export interface StudentAttendanceEntity {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: string;
  notes?: string;
  markedBy: string;
  markedByUser: User;
  createdAt: string;
  updatedAt: string;
  student: StudentEntity;
}

export interface AttendanceFilters {
  page?: number;
  limit?: number;
  search?: string;
}
