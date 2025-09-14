import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  date,
  time,
  pgEnum,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "teacher",
  "principal",
]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
]);

export const schools = pgTable("schools", {
  id: varchar("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

// Users table (merged with teachers)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolId: varchar("school_id", { length: 15 })
    .notNull()
    .references(() => schools.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }),
  // Teacher-specific fields (nullable for non-teachers)
  employeeId: varchar("employee_id", { length: 50 }).notNull().unique(),
  department: varchar("department", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  hireDate: date("hire_date"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Classes table
export const classes = pgTable("classes", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolId: varchar("school_id", { length: 15 })
    .notNull()
    .references(() => schools.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  grade: varchar("grade", { length: 20 }).notNull(),
  section: varchar("section", { length: 10 }).notNull(),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Teacher Class Assignment table (Many-to-Many relationship for class-based attendance)
export const teacherAssignments = pgTable("teacher_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  classId: uuid("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  isPrimaryTeacher: boolean("is_primary_teacher").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Students table
export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolId: varchar("school_id", { length: 15 })
    .notNull()
    .references(() => schools.id, { onDelete: "cascade" }),
  studentId: varchar("student_id", { length: 50 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  dateOfBirth: date("date_of_birth"),
  gender: genderEnum("gender").notNull(),
  classId: uuid("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Teacher attendance table
export const teacherAttendance = pgTable("teacher_attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  latitude: numeric("latitude").notNull(),
  longitude: numeric("longitude").notNull(),
  checkIn: timestamp("check_in", { withTimezone: true }).notNull(),
  status: attendanceStatusEnum("status").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Student attendance table
export const studentAttendance = pgTable("student_attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  classId: uuid("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").notNull(),
  notes: text("notes"),
  markedBy: uuid("marked_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const subjects = pgTable("subjects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const marks = pgTable("marks", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  marks: numeric("marks").notNull(),
  month: varchar("month", { length: 100 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const schoolRelations = relations(schools, ({ many }) => ({
  classes: many(classes),
  users: many(users),
  students: many(students),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignments: many(teacherAssignments),
  teacherAttendance: many(teacherAttendance),
  markedAttendance: many(studentAttendance),
}));

export const classesRelations = relations(classes, ({ many }) => ({
  teacherAssignments: many(teacherAssignments),
  students: many(students),
  studentAttendance: many(studentAttendance),
}));

export const teacherAssignmentsRelations = relations(
  teacherAssignments,
  ({ one }) => ({
    teacher: one(users, {
      fields: [teacherAssignments.teacherId],
      references: [users.id],
    }),
    class: one(classes, {
      fields: [teacherAssignments.classId],
      references: [classes.id],
    }),
    subject: one(subjects, {
      fields: [teacherAssignments.subjectId],
      references: [subjects.id],
    }),
  })
);

export const studentsRelations = relations(students, ({ one, many }) => ({
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id],
  }),
  attendance: many(studentAttendance),
}));

export const teacherAttendanceRelations = relations(
  teacherAttendance,
  ({ one }) => ({
    teacher: one(users, {
      fields: [teacherAttendance.teacherId],
      references: [users.id],
    }),
  })
);

export const studentAttendanceRelations = relations(
  studentAttendance,
  ({ one }) => ({
    student: one(students, {
      fields: [studentAttendance.studentId],
      references: [students.id],
    }),
    class: one(classes, {
      fields: [studentAttendance.classId],
      references: [classes.id],
    }),
    markedBy: one(users, {
      fields: [studentAttendance.markedBy],
      references: [users.id],
    }),
  })
);

export const liveLocations = pgTable("live_locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  latitude: numeric("latitude").notNull(),
  longitude: numeric("longitude").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const liveLocationsRelations = relations(liveLocations, ({ one }) => ({
  user: one(users, {
    fields: [liveLocations.userId],
    references: [users.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;
export type TeacherAssignment = typeof teacherAssignments.$inferSelect;
export type NewTeacherAssignment = typeof teacherAssignments.$inferInsert;
export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type TeacherAttendance = typeof teacherAttendance.$inferSelect;
export type NewTeacherAttendance = typeof teacherAttendance.$inferInsert;
export type StudentAttendance = typeof studentAttendance.$inferSelect;
export type NewStudentAttendance = typeof studentAttendance.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
export type Mark = typeof marks.$inferSelect;
export type NewMark = typeof marks.$inferInsert;
export type LiveLocation = typeof liveLocations.$inferSelect;
export type NewLiveLocation = typeof liveLocations.$inferInsert;
export type School = typeof schools.$inferSelect;
export type NewSchool = typeof schools.$inferInsert;
