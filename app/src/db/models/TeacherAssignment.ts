import {
  field,
  date,
  readonly,
  relation,
} from "@nozbe/watermelondb/decorators";
import { Model, Relation } from "@nozbe/watermelondb";

import User from "./User";
import Class from "./Class";
import Subject from "./Subject";

export default class TeacherAssignment extends Model {
  static table = "teacher_assignments";

  @field("teacher_id") teacherId!: string;
  @field("class_id") classId!: string;
  @field("subject_id") subjectId!: string;
  @field("is_primary_teacher") isPrimaryTeacher!: boolean;
  @field("is_active") isActive!: boolean;
  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;

  @relation("users", "teacher_id") teacher!: Relation<User>;
  @relation("classes", "class_id") class!: Relation<Class>;
  @relation("subjects", "subject_id") subject!: Relation<Subject>;
}
