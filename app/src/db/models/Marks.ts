import { Model } from "@nozbe/watermelondb";
import { field, date, readonly } from "@nozbe/watermelondb/decorators";

export default class Marks extends Model {
  static table = "marks";

  @field("marks_id") markId!: string;
  @field("student_id") studentId!: string;
  @field("subject_id") subjectId!: string;
  @field("marks") marks!: number;
  @field("month") month!: string;
  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;
}
