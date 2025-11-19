import type { ClassEntity } from "./class";
import type { SchoolEntity } from "./school";
import type { StudentEntity } from "./student";
import type { SubjectEntity } from "./subject";

export interface MarksEntity {
  id: string;
  studentId: string;
  subjectId: string;
  marks: number;
  month: string;
  createdAt: string;
  updatedAt: string;
  student: StudentEntity;
  subject: SubjectEntity;
  school: SchoolEntity;
  class: ClassEntity;
}

export interface MarksFilters {
  page?: number;
  limit?: number;
  search?: string;
  studentId?: string;
  subjectId?: string;
}
