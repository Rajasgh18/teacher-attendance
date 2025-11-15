import {
  field,
  date,
  readonly,
  relation,
} from "@nozbe/watermelondb/decorators";
import { Relation, Model } from "@nozbe/watermelondb";
import Class from "./Class";
import Student from "./Student";
import User from "./User";

export default class StudentAttendance extends Model {
  static table = "student_attendance";

  @field("student_id") studentId!: string;
  @field("class_id") classId!: string;
  @field("date") date!: number;
  @field("status") status!: string;
  @field("notes") notes!: string | null;
  @field("marked_by") markedBy!: string;
  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;

  @relation("classes", "class_id") class!: Relation<Class>;
  @relation("students", "student_id") student!: Relation<Student>;
  @relation("users", "marked_by") markedByUser!: Relation<User>;
}
