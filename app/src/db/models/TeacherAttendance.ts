import {
  field,
  date,
  readonly,
  relation,
} from "@nozbe/watermelondb/decorators";
import { Relation, Model } from "@nozbe/watermelondb";

import User from "./User";

export default class TeacherAttendance extends Model {
  static table = "teacher_attendance";

  @field("teacher_id") teacherId!: string;
  @field("latitude") latitude!: number;
  @field("longitude") longitude!: number;
  @field("check_in") checkIn!: number | undefined;
  @field("status") status!: string;
  @field("notes") notes!: string | undefined;
  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;

  @relation("users", "teacher_id") teacher!: Relation<User>;
}
