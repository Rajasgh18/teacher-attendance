import { useEffect, useState } from "react";

import { classService } from "@/services/class-service";
import { studentService } from "@/services/student-service";
import { subjectService } from "@/services/subject-service";
import { userService } from "@/services/user-service";
import type { ClassEntity } from "@/types/class";
import type { StudentEntity } from "@/types/student";
import type { SubjectEntity } from "@/types/subject";
import type { AuthUser } from "@/types/auth";
import { useAuth } from "@/providers/auth-provider";

export interface DashboardSummary {
  totalClasses: number;
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalAdmins?: number;
  totalUsers?: number;
  contextLabel?: string;
  contextValue?: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  teachers: AuthUser[];
  // All data for charts
  allClasses: ClassEntity[];
  allStudents: StudentEntity[];
  allTeachers: AuthUser[];
  allSubjects: SubjectEntity[];
}

export function useDashboardData() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      if (!user) {
        setData(null);
        setIsLoading(false);
        return;
      }

      const isPrincipal = user.role === "principal";

      if (isPrincipal && !user.schoolId) {
        setError("Principal account is not linked to a school.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const filters =
        isPrincipal && user.schoolId ? { schoolId: user.schoolId } : {};

      try {
        const [
          classesAllResult,
          studentsAllResult,
          teachersAllResult,
          subjectsAllResult,
          stats,
        ] = await Promise.all([
          classService.list({ ...filters, limit: 1000000 }), // Fetch all for charts
          studentService.list({ ...filters, limit: 1000000 }), // Fetch all for charts
          userService.getAll({ ...filters, limit: 1000000, role: "teacher" }), // Fetch all for charts
          subjectService.list({ ...filters, limit: 1000000 }), // Fetch all for charts
          isPrincipal ? Promise.resolve(null) : userService.getStats(),
        ]);

        if (!isMounted) {
          return;
        }

        const teachers = teachersAllResult.data.filter(
          (teacher) => teacher.role === "teacher",
        );

        const totalTeachers = stats
          ? stats.totalTeachers
          : teachersAllResult.pagination.total;

        const summary: DashboardSummary = {
          totalClasses: classesAllResult.pagination.total,
          totalStudents: studentsAllResult.pagination.total,
          totalTeachers,
          totalSubjects: subjectsAllResult.pagination.total,
        };

        if (stats) {
          summary.totalAdmins = stats.totalAdmins;
          summary.totalUsers = stats.totalUsers;
        }

        if (isPrincipal && user.school?.name) {
          summary.contextLabel = "School";
          summary.contextValue = user.school.name;
        }

        setData({
          summary,
          teachers,
          // Include all data for charts
          allClasses: classesAllResult.data,
          allStudents: studentsAllResult.data,
          allTeachers: teachersAllResult.data.filter((t) => t.role === "teacher"),
          allSubjects: subjectsAllResult.data,
        });
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load dashboard data.";
        setError(message);
        setData(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { data, error, isLoading };
}
