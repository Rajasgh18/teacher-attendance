import type { DashboardData } from "../../../hooks/useDashboardData";
import type { ClassEntity } from "@/types/class";
import type { StudentEntity } from "@/types/student";
import type { AuthUser } from "@/types/auth";
import type { SubjectEntity } from "@/types/subject";

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

/**
 * Transform classes data into grade distribution chart data
 */
export function getGradeDistribution(classes: ClassEntity[]): ChartDataPoint[] {
  const gradeCounts = new Map<string, number>();

  classes.forEach((cls) => {
    const grade = cls.grade || "Unknown";
    gradeCounts.set(grade, (gradeCounts.get(grade) || 0) + 1);
  });

  return Array.from(gradeCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      // Sort by grade number if possible
      const aNum = parseInt(a.name);
      const bNum = parseInt(b.name);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.name.localeCompare(b.name);
    });
}

/**
 * Transform students data into gender distribution chart data
 */
export function getGenderDistribution(
  students: StudentEntity[],
): ChartDataPoint[] {
  const genderCounts = new Map<string, number>();

  students.forEach((student) => {
    const gender = student.gender || "other";
    genderCounts.set(gender, (genderCounts.get(gender) || 0) + 1);
  });

  return Array.from(genderCounts.entries()).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));
}

/**
 * Transform teachers data into department distribution chart data
 */
export function getDepartmentDistribution(
  teachers: AuthUser[],
): ChartDataPoint[] {
  const deptCounts = new Map<string, number>();

  teachers.forEach((teacher) => {
    const dept = teacher.department || "Unassigned";
    deptCounts.set(dept, (deptCounts.get(dept) || 0) + 1);
  });

  return Array.from(deptCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Transform classes data into academic year distribution chart data
 */
export function getAcademicYearDistribution(
  classes: ClassEntity[],
): ChartDataPoint[] {
  const yearCounts = new Map<string, number>();

  classes.forEach((cls) => {
    const year = cls.academicYear || "Unknown";
    yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
  });

  return Array.from(yearCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.name.localeCompare(a.name)); // Sort descending (newest first)
}

/**
 * Transform entities into timeline data (creation over time)
 * @deprecated Use getEntityTimelineAll instead for better data coverage
 */
export function getEntityTimeline(data: DashboardData): ChartDataPoint[] {
  return getEntityTimelineAll({
    allClasses: data.allClasses,
    allStudents: data.allStudents,
    allTeachers: data.allTeachers,
    allSubjects: data.allSubjects,
  });
}

/**
 * Get summary comparison data for area chart
 */
export function getSummaryComparison(
  summary: DashboardData["summary"],
): ChartDataPoint[] {
  return [
    { name: "Classes", value: summary.totalClasses },
    { name: "Students", value: summary.totalStudents },
    { name: "Teachers", value: summary.totalTeachers },
    { name: "Subjects", value: summary.totalSubjects },
  ];
}

/**
 * Get students per class distribution
 */
export function getStudentsPerClass(
  classes: ClassEntity[],
  students: StudentEntity[],
): ChartDataPoint[] {
  const classStudentCounts = new Map<string, number>();

  students.forEach((student) => {
    const classId = student.classId;
    classStudentCounts.set(classId, (classStudentCounts.get(classId) || 0) + 1);
  });

  const classMap = new Map(classes.map((cls) => [cls.id, cls]));

  return Array.from(classStudentCounts.entries())
    .map(([classId, count]) => {
      const cls = classMap.get(classId);
      return {
        name: cls
          ? `${cls.name} (${cls.grade}${cls.section ? ` ${cls.section}` : ""})`
          : `Class ${classId}`,
        value: count,
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 classes
}

/**
 * Transform timeline data to use all entities
 */
export function getEntityTimelineAll(data: {
  allClasses: ClassEntity[];
  allStudents: StudentEntity[];
  allTeachers: AuthUser[];
  allSubjects: SubjectEntity[];
}): ChartDataPoint[] {
  const monthCounts = new Map<
    string,
    { classes: number; students: number; teachers: number; subjects: number }
  >();

  const processEntity = (
    entity: { createdAt: string },
    type: "classes" | "students" | "teachers" | "subjects",
  ) => {
    if (!entity.createdAt) return;
    const date = new Date(entity.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthCounts.has(monthKey)) {
      monthCounts.set(monthKey, {
        classes: 0,
        students: 0,
        teachers: 0,
        subjects: 0,
      });
    }
    const counts = monthCounts.get(monthKey)!;
    counts[type]++;
    monthCounts.set(monthKey, counts);
  };

  data.allClasses.forEach((cls) => processEntity(cls, "classes"));
  data.allStudents.forEach((student) => processEntity(student, "students"));
  data.allTeachers.forEach((teacher) => processEntity(teacher, "teachers"));
  data.allSubjects.forEach((subject) => processEntity(subject, "subjects"));

  return Array.from(monthCounts.entries())
    .map(([key, counts]) => {
      const date = new Date(key + "-01");
      const name = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      return {
        name,
        Classes: counts.classes,
        Students: counts.students,
        Teachers: counts.teachers,
        Subjects: counts.subjects,
      };
    })
    .sort((a, b) => {
      const dateA = new Date(a.name);
      const dateB = new Date(b.name);
      return dateA.getTime() - dateB.getTime();
    });
}
