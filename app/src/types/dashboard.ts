import { TeacherAssignment } from "./teacher";
import { ClassWithDetails } from "./class";

export interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  todaySessions: number;
  attendanceThisMonth: number;
}

export interface TeacherDashboardData {
  classes: ClassWithDetails[];
  assignments: TeacherAssignment[];
  stats: DashboardStats;
}
