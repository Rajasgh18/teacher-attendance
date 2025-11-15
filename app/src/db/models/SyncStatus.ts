import { Model } from "@nozbe/watermelondb";
import { field, date, readonly } from "@nozbe/watermelondb/decorators";

export default class SyncStatus extends Model {
  static table = "sync_status";

  @field("table_name") tableName!: string;
  @field("last_sync") lastSync!: number;
  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;
}
