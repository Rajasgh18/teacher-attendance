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
  const knownSheets = [
    "School Details",
    "Class",
    "Student details",
    "Teacher Details",
  ];

  const workbook = xlsx.readFile("./Attendance Data.xlsx");

  const sheetNames = workbook.SheetNames;

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

      switch (sheetName) {
        case "School Details":
          handleSchoolData(data);
          break;
        case "Class":
          // handleClassData(data);
          break;
        case "Student details":
          handleStudentData(data);
          break;
        case "Teacher Details":
          // handleUsersData(data);
          break;
      }
    }
  }
}

async function handleSchoolData(data: Record<string, string>[]) {
  if (!data || data.length === 0) {
    console.log("No school data to process.");
    return;
  }

  const allSchoolData: School[] = data
    .filter(school => school && school["U-Dise code"] && school["School Name"])
    .map(school => {
      if (!school || !school["U-Dise code"] || !school["School Name"]) {
        console.error(`Invalid school data: ${JSON.stringify(school)}`);
        return undefined;
      }

      return {
        id: school["U-Dise code"],
        name: school["School Name"],
      };
    })
    .filter((school): school is School => !!school);

  for (const schoolData of allSchoolData) {
    // await db.insert(schools).values(schoolData);
  }
  allSchools = allSchoolData;
  console.log(`Created ${allSchools.length} schools successfully.`);
}

async function handleClassData(data: Record<string, string>[]) {
  if (!data || data.length === 0) {
    console.log("No class data to process.");
    return;
  }
  const allClassesData: NewClass[] = data.flatMap(row => {
    const className = row["class name"];
    const gradeStr = row["grade"];
    const section = row["section"];
    const academicYear = row["academic_year"];
    const schoolId = row["U-Dise code School"];

    if (!className || !gradeStr || !academicYear || !schoolId) {
      console.error(
        `Skipping invalid class data row: className: ${className}, grade: ${gradeStr}, academicYear: ${academicYear}, schoolId: ${schoolId}`
      );
      return [];
    }

    const gradeParts = String(gradeStr).toLowerCase().split(" to ");

    if (gradeParts[0] === undefined || gradeParts[1] === undefined) {
      console.error(
        `Skipping row with invalid grade format: ${JSON.stringify(row)}`
      );
      return [];
    }

    const startGrade = gradeParts?.[0] ? parseInt(gradeParts[0], 10) : NaN;
    const endGrade =
      gradeParts?.length > 1 ? parseInt(gradeParts[1], 10) : startGrade;

    if (isNaN(startGrade) || isNaN(endGrade) || startGrade > endGrade) {
      console.error(
        `Skipping row with invalid grade format: ${JSON.stringify(row)}`
      );
      return [];
    }

    const generatedClasses: NewClass[] = [];
    for (let grade = startGrade; grade <= endGrade; grade++) {
      generatedClasses.push({
        schoolId,
        name: className,
        grade: String(grade),
        section: section || "A",
        academicYear,
      });
    }
    return generatedClasses;
  });

  if (allClassesData.length > 0) {
    const batchSize = 100; // Process 100 records at a time
    console.log(
      `Inserting ${allClassesData.length} classes in batches of ${batchSize}...`
    );

    for (let i = 0; i < allClassesData.length; i += batchSize) {
      // const batch = allClassesData.slice(i, i + batchSize);
      // console.log(`Processing class batch ${i / batchSize + 1}...`);
      // Using onConflictDoNothing to prevent crashes if a class already exists
      // await db.insert(classes).values(batch).onConflictDoNothing();
    }
    console.log("All class batches processed successfully.");
  }
  allClass = allClassesData;
  console.log(`Created ${allClassesData.length} classes successfully.`);
}

async function handleStudentData(data: Record<string, any>[]) {
  if (!data || data.length === 0) {
    console.log("No student data to process.");
    return;
  }

  // For unique 11-digit student IDs, find the last ID in the database
  // and increment from there.
  console.log("Determining starting student ID...");
  const lastStudentArr = await db
    .select({ studentId: students.studentId })
    .from(students)
    .orderBy(desc(students.studentId))
    .limit(1);

  const lastStudentId = lastStudentArr[0]?.studentId;
  // Start with the next ID or a base 11-digit number if no students exist.
  let nextId = lastStudentId ? BigInt(lastStudentId) + 1n : 10000000000n;
  console.log(`Starting student ID will be ${nextId}`);

  // 1. Fetch existing data from DB and build maps for efficient lookups.
  console.log("Fetching existing schools and classes from the database...");
  const allSchoolsFromDB = await db.select().from(schools);
  const schoolMap = new Map(allSchoolsFromDB.map(s => [s.id, s]));

  const allClassesFromDB = await db.select().from(classes);
  const classMap = new Map(
    allClassesFromDB.map(c => [`${c.schoolId}-${c.grade}-${c.section}`, c])
  );
  console.log(`Found ${schoolMap.size} schools and ${classMap.size} classes.`);

  const newSchoolsToCreate = new Map<string, NewSchool>();
  const newClassesToCreate = new Map<string, NewClass>();
  const studentsToProcess: any[] = [];

  // 2. First pass over the data to identify what needs to be created.
  console.log("Analyzing student data to identify new schools and classes...");
  for (const row of data) {
    const schoolId = row["U-Dise code School"];
    const gradeInt = romanToInt(row["grade"]);
    const grade = gradeInt.toString();
    const section = row["section(A/B/SCI/COM/ARTS)"];

    if (!schoolId || isNaN(gradeInt) || !section) {
      console.error(
        `Skipping student row with missing or invalid essential data: schoolId: ${schoolId}, grade: ${row["grade"]}, section: ${section}`
      );
      continue;
    }

    studentsToProcess.push(row);

    // Identify missing schools that need to be created.
    if (!schoolMap.has(schoolId) && !newSchoolsToCreate.has(schoolId)) {
      newSchoolsToCreate.set(schoolId, {
        id: schoolId,
        name: (row["address"] as string) || "Unknown School", // Fallback for school name
      });
    }

    // Identify missing classes that need to be created.
    const classKey = `${schoolId}-${grade}-${section}`;
    if (!classMap.has(classKey) && !newClassesToCreate.has(classKey)) {
      newClassesToCreate.set(classKey, {
        schoolId,
        grade: grade,
        section,
        name: "Regular",
        academicYear: "2025-26",
      });
    }
  }

  // 3. Batch insert any new schools.
  if (newSchoolsToCreate.size > 0) {
    const newSchools = Array.from(newSchoolsToCreate.values());
    console.log(`Creating ${newSchools.length} new schools...`);
    await db.insert(schools).values(newSchools).onConflictDoNothing();
    // Add newly identified schools to our map for the next step.
    newSchools.forEach(s => schoolMap.set(s.id, s as School));
  }

  // 4. Batch insert any new classes.
  if (newClassesToCreate.size > 0) {
    const newClasses = Array.from(newClassesToCreate.values());
    console.log(`Creating ${newClasses.length} new classes...`);
    await db.insert(classes).values(newClasses).onConflictDoNothing();

    // Re-fetch all classes to get the IDs of the ones just created.
    console.log("Re-fetching classes to update with new entries...");
    const allUpdatedClasses = await db.select().from(classes);
    allUpdatedClasses.forEach(c => {
      const classKey = `${c.schoolId}-${c.grade}-${c.section}`;
      classMap.set(classKey, c);
    });
  }

  // 5. Second pass: Prepare student records for insertion.
  console.log("Preparing student records for insertion...");
  const allStudentData: NewStudent[] = [];
  for (const row of studentsToProcess) {
    const schoolId = row["U-Dise code School"];
    const grade = romanToInt(row["grade"]).toString();
    const section = row["section(A/B/SCI/COM/ARTS)"];

    const classKey = `${schoolId}-${grade}-${section}`;
    const foundClass = classMap.get(classKey);

    if (!foundClass || !foundClass.id) {
      console.error(
        `FATAL: Could not find class ID for key ${classKey} for student ${row["first name"]}. This should not happen.`
      );
      continue;
    }

    const student: NewStudent = {
      schoolId,
      classId: foundClass.id,
      studentId: (nextId++).toString(), // Assign and increment the unique ID
      firstName: row["first name"],
      lastName: row["last name"],
      email: row["email"],
      address: row["address"],
      gender: row["gender"]?.toLowerCase(),
    };

    allStudentData.push(student);
  }

  const batchSize = 100; // Process 100 records at a time
  console.log(
    `Inserting ${allStudentData.length} students in batches of ${batchSize}...`
  );

  for (let i = 0; i < allStudentData.length; i += batchSize) {
    const batch = allStudentData.slice(i, i + batchSize);
    console.log(`Processing students batch ${i / batchSize + 1}...`);
    // Using onConflictDoNothing to prevent crashes if a class already exists
    await db.insert(students).values(batch).onConflictDoNothing();
  }

  console.log(`Created ${allStudentData.length} students successfully.`);
}

async function handleUsersData(data: Record<string, any>[]) {
  if (!data || data.length === 0) return;

  const defaultPasswordHash = await hashPassword("teacher123");

  const allUserData: NewUser[] = data
    .map(row => {
      const {
        "first name": firstName,
        "last name": lastName,
        role,
        email,
        department,
        "phone number": phone,
        address,
        "joining date": joiningDate,
        "teacher id(1,2,3)": employeeId,
        "U-Dise code School": schoolId,
      } = row;

      const userRole = role.includes("प्रधान पाठक")
        ? UserRole.PRINCIPAL
        : UserRole.TEACHER;

      if (!firstName || !userRole || !employeeId || !schoolId) {
        console.error(
          `Skipping user with missing essential data: ${firstName}`
        );
        return null;
      }

      if (!userRoleEnum.enumValues.includes(userRole)) {
        console.error(
          `Skipping user with invalid role: ${role} for user ${employeeId}`
        );
        return null;
      }

      const user: NewUser = {
        schoolId,
        firstName,
        lastName,
        email,
        role: userRole,
        employeeId: String(employeeId),
        passwordHash: defaultPasswordHash,
        department,
        phone: String(phone || ""),
        address,
      };
      return user;
    })
    .filter((user): user is NewUser => user !== null);

  for (const userData of allUserData) {
    if (!allSchools.find(sc => sc.id === userData.schoolId)) {
      await db
        .insert(schools)
        .values({ id: userData.schoolId, name: userData.address as string })
        .onConflictDoNothing();
      console.log(`Creating new School: ${userData.schoolId}`);
      allSchools.push({
        id: userData.schoolId,
        name: userData.address as string,
      });
    }
  }

  if (allUserData.length > 0) {
    await db.insert(users).values(allUserData);
  }
  console.log(`Created ${allUserData.length} users successfully`);
}

// --- Run the main function ---
main().catch(error => {
  console.error("An error occurred during the script execution:", error);
  process.exit(1);
});
