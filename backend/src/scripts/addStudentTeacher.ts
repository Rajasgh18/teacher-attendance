import xlsx from "xlsx";
import {
  NewClass,
  School,
  schools,
  classes,
  NewStudent,
  User,
  NewSchool,
  NewUser,
  userRoleEnum,
  students,
  users,
  NewSubject,
  subjects,
  Class,
} from "@/db/schema";
import { db } from "@/db";
import bcrypt from "bcryptjs";
import { UserRole } from "@/types";
import { and, desc, eq } from "drizzle-orm";

let allSchools: NewSchool[] = [];
let allClass: NewClass[] = [];
let allStudents: NewStudent[] = [];
let allUsers: User[] = [];

const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

function romanToInt(s: string): number {
  if (!s || typeof s !== "string") {
    return NaN;
  }
  const romanMap: { [key: string]: number } = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let result = 0;
  const str = s.toUpperCase().trim();

  for (let i = 0; i < str.length; i++) {
    const currentVal = romanMap[str[i] as string];
    if (currentVal === undefined) return NaN; // Invalid character

    const nextVal = romanMap[str[i + 1] as string];
    if (nextVal && currentVal < nextVal) {
      result -= currentVal;
    } else {
      result += currentVal;
    }
  }
  return result;
}

async function main() {
  const knownSheets = ["TEACHERS", "STUDENT "];

  const workbook = xlsx.readFile("./Student_Teacher.xlsx");

  for (const sheetName of knownSheets) {
    if (knownSheets.includes(sheetName)) {
      const workSheet = workbook.Sheets[sheetName];

      if (!workSheet) {
        console.error(`Sheet ${sheetName} is empty`);
        continue;
      }

      const data = xlsx.utils.sheet_to_json(workSheet) as Record<
        string,
        string
      >[];

      switch (sheetName.toLowerCase()) {
        case "teachers":
          break;
        case "student ":
          break;
      }
    }
  }
}

const handleClassData = async (data: Record<string, string>[]) => {
  const classesToInsert: NewClass[] = [];
  for (const row of data) {
    const { "Class": className, "Section": section, "UDISE CODE": schoolId } = row;
    if (!className || !section || !schoolId) {
      console.error(
        `Skipping class row with missing essential data: className: ${className}, section: ${section}, schoolId: ${schoolId}`
      );
      continue;
    }

    if(!classesToInsert.find(c => c.grade === romanToInt(className).toString() && c.section === section.trim() && c.schoolId === schoolId.toString().trim())) {
      classesToInsert.push({
        name: `${className.trim()} - ${section.trim()}`,
        grade: romanToInt(className).toString(),
        section: section.trim(),
        schoolId: schoolId.toString().trim(),
        academicYear: "2025-26",
      });
    }
  }

  if (classesToInsert.length > 0) {
    await db.insert(classes).values(classesToInsert).onConflictDoNothing();
  }

  console.log(`Created ${classesToInsert.length} classes successfully.`);
}

const handleStudentData = async (data: Record<string, string>[]) => {
  const classesInDb = await db.select().from(classes);
  const classesMap = new Map<string, Class>();
  classesInDb.forEach(c => {
    classesMap.set(`${c.schoolId}-${c.grade}-${c.section}`, c);
  });

  const studentsToInsert: NewStudent[] = [];
  for (const row of data) {
    const { "Name": studentName, "UDISE CODE": schoolId, "Gender": gender, "Class": className, "Section": section } = row;

    if (!studentName || !schoolId || !gender || !className || !section) {
      console.error(
        `Skipping student row with missing essential data: studentName: ${studentName}, schoolId: ${schoolId}, gender: ${gender} className: ${className}, section: ${section}`
      );
      continue;
    }

    const grade = romanToInt(className).toString();
    
    if(!classesMap.has(`${schoolId}-${grade}-${section.trim()}`)) {
      console.error(
        `Skipping student row with missing class: studentName: ${studentName}, schoolId: ${schoolId}, gender: ${gender} className: ${className}, section: ${section}`
      );
      continue;
    }
    
    studentsToInsert.push({
      schoolId: schoolId.toString().trim(),
      classId: classesMap.get(`${schoolId}-${grade}-${section.trim()}`)?.id as string,
      studentId: "",
      firstName: studentName.trim(),
      lastName: "",
      email: "",
      gender: gender.toLowerCase().trim() as "male" | "female" | "other",
      isActive: true,
    });
  }

  if (studentsToInsert.length > 0) {
    await db.insert(students).values(studentsToInsert).onConflictDoNothing();
  }

  console.log(`Created ${studentsToInsert.length} students successfully.`);
}

async function handleSubjectData(data: Record<string, string>[]) {
  const subjectsToInsert: NewSubject[] = [];

  const checkSubjectExists = (name: string, code: string) => {
    const subject = subjectsToInsert.find(
      subject => subject.name === name || subject.code === code
    );
    return subject ? true : false;
  };

  for (const row of data) {
    const { Main_Subject_Taught_1: subject1, Main_Subject_Taught_2: subject2 } =
      row;

    if (subject1) {
      const subject1Format = subject1.split("-");

      if (subject1Format.length !== 2) {
        if (!checkSubjectExists(subject1Format[0] as string, "")) {
          subjectsToInsert.push({
            name: subject1Format[0]?.trim() as string,
            code: "",
          });
        }
      }

      const [subject1Code, subject1Name] = subject1Format;
      if (subject1Code && subject1Name) {
        if (!checkSubjectExists(subject1Name.trim(), subject1Code.trim())) {
          subjectsToInsert.push({
            name: subject1Name.trim(),
            code: subject1Code.trim(),
          });
        }
      }
    }

    if (subject2) {
      const subject2Format = subject2.split("-");

      if (subject2Format.length !== 2) {
        if (!checkSubjectExists(subject2Format[0] as string, "")) {
          subjectsToInsert.push({
            name: subject2Format[0]?.trim() as string,
            code: "",
          });
        }
      }

      const [subject2Code, subject2Name] = subject2Format;
      if (subject2Code && subject2Name) {
        if (!checkSubjectExists(subject2Name.trim(), subject2Code.trim())) {
          subjectsToInsert.push({
            name: subject2Name.trim(),
            code: subject2Code.trim(),
          });
        }
      }
    }
  }

  if (subjectsToInsert.length > 0) {
    await db.insert(subjects).values(subjectsToInsert).onConflictDoNothing();
  }

  console.log(`Created ${subjectsToInsert.length} subjects successfully.`);
}

async function handleTeacherData(data: Record<string, string>[]) {
  const teachersToInsert: NewUser[] = [];
  for (const row of data) {
    const { "Staff_Name": teacherName, "State_Staff_Code": employeeId, "DISE CODE": schoolId } = row;

    if (!teacherName || !employeeId || !schoolId) {
      console.error(
        `Skipping teacher row with missing essential data: Name: ${teacherName}, Employee ID: ${employeeId}, School ID: ${schoolId}`
      );
      continue;
    }

    if (
      !teachersToInsert.find(teacher => teacher.employeeId === employeeId.toString().trim())
    ) {
      teachersToInsert.push({
        firstName: teacherName.trim(),
        passwordHash: await hashPassword("teacher123"),
        role: UserRole.TEACHER,
        employeeId: employeeId.toString().trim(),
        schoolId: schoolId.toString().trim(),
        isActive: true,
      });
    }
  }

  if (teachersToInsert.length > 0) {
    try {
      await db.insert(users).values(teachersToInsert);
    } catch (error) {
      console.error(`Error inserting teachers: ${error}`);
    }
  }

  console.log(`Created ${teachersToInsert.length} teachers successfully.`);
}

async function handleSchoolDataInStudents(data: Record<string, string>[]) {
  const schoolsInDb = await db.select().from(schools);
  
  const schoolsToInsert: NewSchool[] = [];
  for (const row of data) {
    const { "SCHOOL NAME ": schoolName, "UDISE CODE": schoolId } = row;

    if (!schoolId || !schoolName) {
      console.error(
        `Skipping school row with missing essential data: ${JSON.stringify(row)}`
      );
      continue;
    }

    if (
      !schoolsInDb.find(school => school.id === schoolId.toString().trim()) && !schoolsToInsert.find(school => school.id === schoolId.toString().trim())
    ) {
      schoolsToInsert.push({
        id: schoolId.toString().trim(),
        name: schoolName.trim(),
      });
    }
  }

  if (schoolsToInsert.length > 0) {
    await db.insert(schools).values(schoolsToInsert).onConflictDoNothing();
  }

  console.log(`Created ${schoolsToInsert.length} schools successfully.`);
}

async function handleSchoolDataInTeachers(data: Record<string, string>[]) {
  const schoolsToInsert: NewSchool[] = [];
  for (const row of data) {
    const { "SCHOOL NAME ": schoolName, "DISE CODE": schoolId } = row;

    if (!schoolId || !schoolName) {
      console.error(
        `Skipping school row with missing essential data: ${JSON.stringify(row)}`
      );
      continue;
    }

    if (
      !schoolsToInsert.find(school => school.id === schoolId.toString().trim())
    ) {
      schoolsToInsert.push({
        id: schoolId.toString().trim(),
        name: schoolName.trim(),
      });
    }
  }

  if (schoolsToInsert.length > 0) {
    // await db.insert(schools).values(schoolsToInsert).onConflictDoNothing();
  }

  console.log(`Created ${schoolsToInsert.length} schools successfully.`);
}

// --- Run the main function ---
main().catch(error => {
  console.error("An error occurred during the script execution:", error);
  process.exit(1);
});
