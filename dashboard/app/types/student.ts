import type { ClassEntity } from "./class";
import type { SchoolEntity } from "./school";

export interface StudentEntity {
  id: string;
  schoolId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  dateOfBirth: string | null;
  gender: "male" | "female" | "other";
  classId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  class: ClassEntity;
  school: SchoolEntity;
}
