export interface ClassEntity {
  id: string;
  schoolId: string;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassTeacherAssignment {
  id: string;
  teacherId: string;
  classId: string;
  subjectId?: string;
  isPrimaryTeacher: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  teacher?: {
    id: string;
    employeeId: string;
    department: string | null;
    phone: string | null;
    firstName: string;
    lastName: string;
    email: string | null;
  };
}

