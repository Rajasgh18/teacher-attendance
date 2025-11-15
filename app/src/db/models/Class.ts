import { Model } from "@nozbe/watermelondb";
import { field, date, readonly } from "@nozbe/watermelondb/decorators";

export default class Class extends Model {
  static table = "classes";

  @field("class_id") classId!: string;
  @field("school_id") schoolId!: string;
  @field("name") name!: string;
  @field("grade") grade!: string;
  @field("section") section!: string;
  @field("academic_year") academicYear!: string;
  @field("description") description!: string | null;
  @field("is_active") isActive!: boolean;
  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;
}
