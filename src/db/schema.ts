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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "teacher",
]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
]);

// Users table (merged with teachers)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  // Teacher-specific fields (nullable for non-teachers)
  employeeId: varchar("employee_id", { length: 50 }).unique(),
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

// Subjects table
export const subjects = pgTable("subjects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  description: text("description"),
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
export const teacherClass = pgTable("teacher_class", {
  id: uuid("id").primaryKey().defaultRandom(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  classId: uuid("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
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
  studentId: varchar("student_id", { length: 50 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
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
  date: date("date").notNull(),
  checkIn: time("check_in"),
  checkOut: time("check_out"),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  classAssignments: many(teacherClass),
  teacherAttendance: many(teacherAttendance),
  markedAttendance: many(studentAttendance),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  // No more teacher assignments since we're class-based
}));

export const classesRelations = relations(classes, ({ many }) => ({
  teacherClassAssignments: many(teacherClass),
  students: many(students),
  studentAttendance: many(studentAttendance),
}));

export const teacherClassRelations = relations(
  teacherClass,
  ({ one }) => ({
    teacher: one(users, {
      fields: [teacherClass.teacherId],
      references: [users.id],
    }),
    class: one(classes, {
      fields: [teacherClass.classId],
      references: [classes.id],
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

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;
export type TeacherClass = typeof teacherClass.$inferSelect;
export type NewTeacherClass = typeof teacherClass.$inferInsert;
export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type TeacherAttendance = typeof teacherAttendance.$inferSelect;
export type NewTeacherAttendance = typeof teacherAttendance.$inferInsert;
export type StudentAttendance = typeof studentAttendance.$inferSelect;
export type NewStudentAttendance = typeof studentAttendance.$inferInsert;
