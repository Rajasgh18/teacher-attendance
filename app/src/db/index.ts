import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import schema from "./schema";
import migrations from "./migrations";

import {
  User,
  Class,
  TeacherAssignment,
  Student,
  TeacherAttendance,
  StudentAttendance,
  Subject,
  Marks,
  SyncStatus,
} from "./models";

// First, create the adapter
const adapter = new SQLiteAdapter({
  schema,
  migrations,
  dbName: "teacherAttendanceDB",
  onSetUpError: error => {
    console.error("❌ Failed to set up the database:", error);
  },
});

const database = new Database({
  adapter,
  modelClasses: [
    User,
    Class,
    TeacherAssignment,
    Student,
    TeacherAttendance,
    StudentAttendance,
    SyncStatus,
    Subject,
    Marks,
  ],
});

// Development helper to clear database (only use in development!)
export const clearDatabase = async () => {
  if (__DEV__) {
    await database.write(async () => {
      await database.unsafeResetDatabase();
    });
  } else {
    console.warn("⚠️ clearDatabase should only be used in development!");
  }
};

export default database;
