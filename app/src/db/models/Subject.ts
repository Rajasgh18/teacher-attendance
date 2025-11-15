import { Model } from "@nozbe/watermelondb";
import { field, date, readonly } from "@nozbe/watermelondb/decorators";

export default class Subject extends Model {
  static table = "subjects";

  @field("subject_id") subjectId!: string;
  @field("name") name!: string;
  @field("code") code!: string;
  @field("description") description!: string | null;
  @field("is_active") isActive!: boolean;
  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;
}
