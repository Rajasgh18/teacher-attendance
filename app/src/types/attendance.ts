import { User } from "./user";
import { Student } from "./student";

export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
}

export interface TeacherAttendance {
  id: string;
  teacherId: string;
  latitude: number;
  longitude: number;
  checkIn?: number;
  status: AttendanceStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface StudentAttendance {
  id: string;
  studentId: string;
  classId: string;
  date: number;
  status: AttendanceStatus;
  notes?: string;
  markedBy: string;
  createdAt: number;
  updatedAt: number;
  student?: Student;
  markedByUser?: User;
}

export interface CreateTeacherAttendanceRequest {
  teacherId: string;
  latitude: number;
  longitude: number;
  checkIn: number;
  status: AttendanceStatus;
  notes?: string;
}

export interface UpdateTeacherAttendanceRequest {
  latitude?: number;
  longitude?: number;
  checkIn?: number;
  status?: AttendanceStatus;
  notes?: string;
}

export interface CreateStudentAttendanceRequest {
  studentId: string;
  classId: string;
  date: number;
  status: AttendanceStatus;
  notes?: string;
  markedBy: string;
}

export interface UpdateStudentAttendanceRequest {
  status?: AttendanceStatus;
  notes?: string;
}

export interface TeacherAttendanceListParams {
  page?: number;
  limit?: number;
  teacherId?: string;
  date?: number;
}

export interface StudentAttendanceListParams {
  page?: number;
  limit?: number;
  studentId?: string;
  classId?: string;
  date?: number;
}
