import { Model } from "@nozbe/watermelondb";
import { field, date, readonly } from "@nozbe/watermelondb/decorators";

export default class User extends Model {
  static table = "users";

  @field("email") email!: string;
  @field("password_hash") passwordHash!: string;
  @field("role") role!: string;
  @field("first_name") firstName!: string;
  @field("last_name") lastName!: string;
  @field("employee_id") employeeId!: string | null;
  @field("school_id") schoolId!: string | null;
  @field("school_name") schoolName!: string | null;
  @field("department") department!: string | null;
  @field("phone") phone!: string | null;
  @field("address") address!: string | null;
  @field("hire_date") hireDate!: string | null;
  @field("is_active") isActive!: boolean;
  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;
}
