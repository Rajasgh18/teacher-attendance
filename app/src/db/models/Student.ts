import {
  field,
  date,
  readonly,
  relation,
} from "@nozbe/watermelondb/decorators";
import { Model, Relation } from "@nozbe/watermelondb";
import Class from "./Class";

export default class Student extends Model {
  static table = "students";

  @field("student_id") studentId!: string;
  @field("first_name") firstName!: string;
  @field("last_name") lastName!: string;
  @field("email") email!: string;
  @field("phone") phone!: string;
  @field("address") address!: string;
  @field("date_of_birth") dateOfBirth!: string;
  @field("gender") gender!: string;
  @field("class_id") classId!: string;
  @field("is_active") isActive!: boolean;
  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;

  @relation("classes", "class_id") class!: Relation<Class>;
}
