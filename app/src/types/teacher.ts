import { Class } from "./class";
import { Subject } from "./subject";
import { Teacher, User } from "./user";

export interface TeacherWithUser extends Teacher {
  // For backward compatibility, but Teacher now includes all user fields
  user: User;
}

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  isActive: boolean;
  isPrimaryTeacher: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TeacherAssignmentWithDetails extends TeacherAssignment {
  teacher: Teacher;
  class: Class;
  subject: Subject;
}

export interface AssignTeacherToClassRequest {
  teacherId: string;
  classId: string;
  isPrimaryTeacher?: boolean;
}

export interface RemoveTeacherFromClassRequest {
  teacherId: string;
  classId: string;
}
