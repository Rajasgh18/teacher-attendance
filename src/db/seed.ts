import { db } from "./index";
import {
  users,
  classes,
  students,
  teacherAssignments,
  teacherAttendance,
  studentAttendance,
  subjects,
} from "./schema";
import bcrypt from "bcryptjs";

// Helper function to hash passwords
const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

// Helper function to generate random coordinates (within a reasonable school area)
const randomCoordinates = () => {
  // Example coordinates for a school area (you can adjust these)
  const baseLat = 40.7128; // New York City latitude
  const baseLng = -74.006; // New York City longitude
  const latOffset = (Math.random() - 0.5) * 0.001; // Small offset
  const lngOffset = (Math.random() - 0.5) * 0.001; // Small offset

  return {
    latitude: (baseLat + latOffset).toString(),
    longitude: (baseLng + lngOffset).toString(),
  };
};

// Helper function to generate random check-in time
const randomCheckInTime = (): Date => {
  const today = new Date();
  const hours = Math.floor(Math.random() * 2) + 7; // 7 AM to 9 AM
  const minutes = Math.floor(Math.random() * 60);
  today.setHours(hours, minutes, 0, 0);
  return today;
};

export async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("🧹 Clearing existing data...");
    await db.delete(studentAttendance);
    await db.delete(teacherAttendance);
    await db.delete(teacherAssignments);
    await db.delete(students);
    await db.delete(classes);
    await db.delete(users);

    // 1. Create Users (including teachers)
    console.log("👥 Creating users...");
    const userData = [
      {
        email: "admin@school.com",
        passwordHash: await hashPassword("admin123"),
        role: "admin" as const,
        firstName: "Admin",
        lastName: "User",
        employeeId: null,
        department: null,
        phone: null,
        address: null,
        hireDate: null,
        isActive: true,
      },
      {
        email: "sarah.johnson@school.com",
        passwordHash: await hashPassword("teacher123"),
        role: "teacher" as const,
        firstName: "Sarah",
        lastName: "Johnson",
        employeeId: "T001",
        department: "Mathematics",
        phone: "+1-555-0101",
        address: "123 Teacher Street, Education City, EC 12345",
        hireDate: "2020-08-15",
        isActive: true,
      },
      {
        email: "michael.chen@school.com",
        passwordHash: await hashPassword("teacher123"),
        role: "teacher" as const,
        firstName: "Michael",
        lastName: "Chen",
        employeeId: "T002",
        department: "Physics",
        phone: "+1-555-0102",
        address: "456 Science Avenue, Education City, EC 12345",
        hireDate: "2019-03-10",
        isActive: true,
      },
      {
        email: "emily.davis@school.com",
        passwordHash: await hashPassword("teacher123"),
        role: "teacher" as const,
        firstName: "Emily",
        lastName: "Davis",
        employeeId: "T003",
        department: "English",
        phone: "+1-555-0103",
        address: "789 Literature Lane, Education City, EC 12345",
        hireDate: "2021-01-20",
        isActive: true,
      },
      {
        email: "david.wilson@school.com",
        passwordHash: await hashPassword("teacher123"),
        role: "teacher" as const,
        firstName: "David",
        lastName: "Wilson",
        employeeId: "T004",
        department: "Computer Science",
        phone: "+1-555-0104",
        address: "321 Tech Road, Education City, EC 12345",
        hireDate: "2018-09-05",
        isActive: true,
      },
    ];

    const createdUsers = await db.insert(users).values(userData).returning();
    console.log(`✅ Created ${createdUsers.length} users`);

    // Get teacher users for assignments
    const teacherUsers = createdUsers.filter(user => user.role === "teacher");

    // 2. Create Classes
    console.log("🏫 Creating classes...");
    const classData = [
      {
        name: "Mathematics 101",
        grade: "10th Grade",
        section: "A",
        academicYear: "2024-2025",
        description:
          "Advanced mathematics including algebra, calculus, and geometry",
        isActive: true,
      },
      {
        name: "Physics Advanced",
        grade: "12th Grade",
        section: "B",
        academicYear: "2024-2025",
        description:
          "Physical sciences including mechanics, thermodynamics, and quantum physics",
        isActive: true,
      },
      {
        name: "English Literature",
        grade: "11th Grade",
        section: "C",
        academicYear: "2024-2025",
        description: "English language and literature studies",
        isActive: true,
      },
      {
        name: "Computer Science",
        grade: "12th Grade",
        section: "D",
        academicYear: "2024-2025",
        description:
          "Computer programming, algorithms, and software development",
        isActive: true,
      },
    ];

    const createdClasses = await db
      .insert(classes)
      .values(classData)
      .returning();
    console.log(`✅ Created ${createdClasses.length} classes`);

    // 3. Create Subjects
    console.log("🏫 Creating subjects...");
    const subjectData = [
      {
        name: "Mathematics",
        code: "MATH",
        description:
          "Advanced mathematics including algebra, calculus, and geometry",
        isActive: true,
      },
      {
        name: "Physics",
        code: "PHYS",
        description:
          "Physical sciences including mechanics, thermodynamics, and quantum physics",
        isActive: true,
      },
      {
        name: "English",
        code: "ENG",
        description: "English language and literature studies",
        isActive: true,
      },
      {
        name: "Computer Science",
        code: "CS",
        description:
          "Computer programming, algorithms, and software development",
        isActive: true,
      },
    ];
    const createdSubjects = await db
      .insert(subjects)
      .values(subjectData)
      .returning();
    console.log(`✅ Created ${createdSubjects.length} subjects`);

    // 3. Create Teacher-Class Assignments
    console.log("👨‍🏫🏫 Creating teacher-class assignments...");
    const teacherAssignmentsData = [
      // Primary assignments (main teachers for each class)
      {
        teacherId: teacherUsers[0]!.id, // Sarah Johnson
        classId: createdClasses[0]!.id, // Mathematics 101
        subjectId: createdSubjects[0]!.id, // Mathematics
        isPrimaryTeacher: true,
        isActive: true,
      },
      {
        teacherId: teacherUsers[1]!.id, // Michael Chen
        classId: createdClasses[1]!.id, // Physics Advanced
        subjectId: createdSubjects[1]!.id, // Physics
        isPrimaryTeacher: true,
        isActive: true,
      },
      {
        teacherId: teacherUsers[2]!.id, // Emily Davis
        classId: createdClasses[2]!.id, // English Literature
        subjectId: createdSubjects[2]!.id, // English
        isPrimaryTeacher: true,
        isActive: true,
      },
      {
        teacherId: teacherUsers[3]!.id, // David Wilson
        classId: createdClasses[3]!.id, // Computer Science
        subjectId: createdSubjects[3]!.id, // Computer Science
        isPrimaryTeacher: true,
        isActive: true,
      },

      // Additional assignments (teachers teaching multiple classes)
      {
        teacherId: teacherUsers[0]!.id, // Sarah Johnson - also teaches Physics Advanced
        classId: createdClasses[1]!.id, // Physics Advanced
        subjectId: createdSubjects[1]!.id, // Physics
        isPrimaryTeacher: false,
        isActive: true,
      },
      {
        teacherId: teacherUsers[1]!.id, // Michael Chen - also teaches Mathematics 101
        classId: createdClasses[0]!.id, // Mathematics 101
        subjectId: createdSubjects[0]!.id, // Mathematics
        isPrimaryTeacher: false,
        isActive: true,
      },
      {
        teacherId: teacherUsers[2]!.id, // Emily Davis - also teaches Computer Science
        classId: createdClasses[3]!.id, // Computer Science
        subjectId: createdSubjects[3]!.id, // Computer Science
        isPrimaryTeacher: false,
        isActive: true,
      },
      {
        teacherId: teacherUsers[3]!.id, // David Wilson - also teaches English Literature
        classId: createdClasses[2]!.id, // English Literature
        subjectId: createdSubjects[2]!.id, // English
        isPrimaryTeacher: false,
        isActive: true,
      },
    ];

    const createdTeacherClass = await db
      .insert(teacherAssignments)
      .values(teacherAssignmentsData)
      .returning();
    console.log(
      `✅ Created ${createdTeacherClass.length} teacher-class assignments`
    );

    // 4. Create Students
    console.log("👨‍🎓 Creating students...");
    const studentData = [
      // Mathematics 101 Students
      {
        studentId: "S001",
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@student.com",
        phone: "+1-555-0201",
        address: "100 Student Street, Education City, EC 12345",
        dateOfBirth: "2008-03-15",
        gender: "female" as const,
        classId: createdClasses[0]!.id,
        isActive: true,
      },
      {
        studentId: "S002",
        firstName: "Bob",
        lastName: "Smith",
        email: "bob.smith@student.com",
        phone: "+1-555-0202",
        address: "101 Student Street, Education City, EC 12345",
        dateOfBirth: "2008-07-22",
        gender: "male" as const,
        classId: createdClasses[0]!.id,
        isActive: true,
      },
      {
        studentId: "S003",
        firstName: "Carol",
        lastName: "Davis",
        email: "carol.davis@student.com",
        phone: "+1-555-0203",
        address: "102 Student Street, Education City, EC 12345",
        dateOfBirth: "2008-11-08",
        gender: "female" as const,
        classId: createdClasses[0]!.id,
        isActive: true,
      },
      {
        studentId: "S004",
        firstName: "David",
        lastName: "Wilson",
        email: "david.wilson@student.com",
        phone: "+1-555-0204",
        address: "103 Student Street, Education City, EC 12345",
        dateOfBirth: "2008-05-12",
        gender: "male" as const,
        classId: createdClasses[0]!.id,
        isActive: true,
      },
      {
        studentId: "S005",
        firstName: "Eva",
        lastName: "Brown",
        email: "eva.brown@student.com",
        phone: "+1-555-0205",
        address: "104 Student Street, Education City, EC 12345",
        dateOfBirth: "2008-09-30",
        gender: "female" as const,
        classId: createdClasses[0]!.id,
        isActive: true,
      },

      // Physics Advanced Students
      {
        studentId: "S006",
        firstName: "Frank",
        lastName: "Miller",
        email: "frank.miller@student.com",
        phone: "+1-555-0206",
        address: "105 Student Street, Education City, EC 12345",
        dateOfBirth: "2006-01-14",
        gender: "male" as const,
        classId: createdClasses[1]!.id,
        isActive: true,
      },
      {
        studentId: "S007",
        firstName: "Grace",
        lastName: "Lee",
        email: "grace.lee@student.com",
        phone: "+1-555-0207",
        address: "106 Student Street, Education City, EC 12345",
        dateOfBirth: "2006-04-25",
        gender: "female" as const,
        classId: createdClasses[1]!.id,
        isActive: true,
      },
      {
        studentId: "S008",
        firstName: "Henry",
        lastName: "Taylor",
        email: "henry.taylor@student.com",
        phone: "+1-555-0208",
        address: "107 Student Street, Education City, EC 12345",
        dateOfBirth: "2006-08-18",
        gender: "male" as const,
        classId: createdClasses[1]!.id,
        isActive: true,
      },

      // English Literature Students
      {
        studentId: "S009",
        firstName: "Ivy",
        lastName: "Anderson",
        email: "ivy.anderson@student.com",
        phone: "+1-555-0209",
        address: "108 Student Street, Education City, EC 12345",
        dateOfBirth: "2007-02-03",
        gender: "female" as const,
        classId: createdClasses[2]!.id,
        isActive: true,
      },
      {
        studentId: "S010",
        firstName: "Jack",
        lastName: "Martinez",
        email: "jack.martinez@student.com",
        phone: "+1-555-0210",
        address: "109 Student Street, Education City, EC 12345",
        dateOfBirth: "2007-06-11",
        gender: "male" as const,
        classId: createdClasses[2]!.id,
        isActive: true,
      },
      {
        studentId: "S011",
        firstName: "Kate",
        lastName: "Garcia",
        email: "kate.garcia@student.com",
        phone: "+1-555-0211",
        address: "110 Student Street, Education City, EC 12345",
        dateOfBirth: "2007-10-28",
        gender: "female" as const,
        classId: createdClasses[2]!.id,
        isActive: true,
      },

      // Computer Science Students
      {
        studentId: "S012",
        firstName: "Liam",
        lastName: "Rodriguez",
        email: "liam.rodriguez@student.com",
        phone: "+1-555-0212",
        address: "111 Student Street, Education City, EC 12345",
        dateOfBirth: "2006-12-07",
        gender: "male" as const,
        classId: createdClasses[3]!.id,
        isActive: true,
      },
      {
        studentId: "S013",
        firstName: "Maya",
        lastName: "Thompson",
        email: "maya.thompson@student.com",
        phone: "+1-555-0213",
        address: "112 Student Street, Education City, EC 12345",
        dateOfBirth: "2006-03-19",
        gender: "female" as const,
        classId: createdClasses[3]!.id,
        isActive: true,
      },
      {
        studentId: "S014",
        firstName: "Noah",
        lastName: "White",
        email: "noah.white@student.com",
        phone: "+1-555-0214",
        address: "113 Student Street, Education City, EC 12345",
        dateOfBirth: "2006-07-04",
        gender: "male" as const,
        classId: createdClasses[3]!.id,
        isActive: true,
      },
      {
        studentId: "S015",
        firstName: "Olivia",
        lastName: "Harris",
        email: "olivia.harris@student.com",
        phone: "+1-555-0215",
        address: "114 Student Street, Education City, EC 12345",
        dateOfBirth: "2006-11-16",
        gender: "female" as const,
        classId: createdClasses[3]!.id,
        isActive: true,
      },
    ];

    const createdStudents = await db
      .insert(students)
      .values(studentData)
      .returning();
    console.log(`✅ Created ${createdStudents.length} students`);

    // 5. Create Teacher Attendance Records (last 30 days)
    console.log("📊 Creating teacher attendance records...");
    const teacherAttendanceData = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const teacher of teacherUsers) {
        const status = Math.random() > 0.1 ? "present" : "absent";

        const coords = randomCoordinates();
        const checkInTime = randomCheckInTime();

        // Set the check-in time to the specific date from the loop
        checkInTime.setFullYear(date.getFullYear());
        checkInTime.setMonth(date.getMonth());
        checkInTime.setDate(date.getDate());

        teacherAttendanceData.push({
          teacherId: teacher.id,
          latitude: coords.latitude,
          longitude: coords.longitude,
          checkIn: checkInTime,
          status: status as "present" | "absent",
          notes: null,
        });
      }
    }

    await db.insert(teacherAttendance).values(teacherAttendanceData);
    console.log(
      `✅ Created ${teacherAttendanceData.length} teacher attendance records`
    );

    // 6. Create Student Attendance Records (last 30 days)
    console.log("📊 Creating student attendance records...");
    const studentAttendanceData = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const student of createdStudents) {
        const status = Math.random() > 0.15 ? "present" : "absent";

        // Format date as YYYY-MM-DD
        const dateString =
          date.getFullYear() +
          "-" +
          String(date.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(date.getDate()).padStart(2, "0");

        studentAttendanceData.push({
          studentId: student.id,
          classId: student.classId,
          date: dateString,
          status: status as "present" | "absent",
          notes: status === "absent" ? "Absent" : null,
          markedBy: teacherUsers[0]!.id, // Sarah Johnson as default marker
        });
      }
    }

    await db.insert(studentAttendance).values(studentAttendanceData);
    console.log(
      `✅ Created ${studentAttendanceData.length} student attendance records`
    );

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📋 Summary:");
    console.log(
      `- ${createdUsers.length} users created (including ${teacherUsers.length} teachers)`
    );
    console.log(`- ${createdClasses.length} classes created`);
    console.log(
      `- ${createdTeacherClass.length} teacher-class assignments created`
    );
    console.log(`- ${createdStudents.length} students created`);
    console.log(
      `- ${teacherAttendanceData.length} teacher attendance records created`
    );
    console.log(
      `- ${studentAttendanceData.length} student attendance records created`
    );

    console.log("\n👨‍🏫🏫 Teacher-Class Assignments:");
    createdTeacherClass.forEach((assignment: any, index: number) => {
      const teacher = teacherUsers.find(t => t.id === assignment.teacherId);
      const class_ = createdClasses.find(c => c.id === assignment.classId);
      const role = assignment.isPrimaryTeacher ? "Primary" : "Additional";
      console.log(
        `  ${index + 1}. ${teacher?.employeeId} (${teacher?.department}) → ${class_?.name} (${class_?.grade} ${class_?.section}) [${role}]`
      );
    });

    console.log("\n🔑 Default Login Credentials:");
    console.log("Admin: admin@school.com / admin123");
    console.log("Teacher: sarah.johnson@school.com / teacher123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log("✅ Seeding completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}
