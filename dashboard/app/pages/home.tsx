import type { Route } from "./+types/home";
import { SummaryCards } from "@/components/summary-cards";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
  BarChart,
  PieChart,
  LineChart,
  AreaChart,
} from "@/components/charts";
import {
  getGradeDistribution,
  getGenderDistribution,
  getAcademicYearDistribution,
  getSummaryComparison,
  getStudentsPerClass,
  getEntityTimelineAll,
} from "@/utils/chartData";
import {
  getChartColor,
  getChartColors,
} from "@/utils/chartColors";
import { LucideLoader2 } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Teacher Attendance" },
    { name: "description", content: "Teacher Attendance Dashboard" },
  ];
}

export default function Home() {
  const { data, error, isLoading } = useDashboardData();

  if(isLoading) 
    return (
      <div className="h-[calc(100vh-3.5rem)] w-full flex items-center justify-center">
      <LucideLoader2 className="animate-spin size-6" />
  </div>
  )
  
  return (
    <main className="p-4">
      <div className="space-y-6">
        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {data && (
          <>
            <SummaryCards summary={data.summary} />
            {/* Charts Section */}
            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-2xl font-bold tracking-tight">
                  Data Visualization & Analysis
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <BarChart
                    title="Class Distribution by Grade"
                    description="Number of classes per grade level"
                    data={getGradeDistribution(data.allClasses)}
                    color={getChartColor(0)}
                  />
                  <PieChart
                    title="Student Gender Distribution"
                    description="Breakdown of students by gender"
                    data={getGenderDistribution(data.allStudents)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <BarChart
                  title="Classes by Academic Year"
                  description="Distribution of classes across academic years"
                  data={getAcademicYearDistribution(data.allClasses)}
                  color={getChartColor(2)}
                />
                <AreaChart
                  title="Entity Summary Comparison"
                  description="Overview of all entities in the system"
                  data={getSummaryComparison(data.summary)}
                  color={getChartColor(3)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <LineChart
                  title="Entity Creation Timeline"
                  description="Growth of entities over time"
                  data={getEntityTimelineAll({
                    allClasses: data.allClasses,
                    allStudents: data.allStudents,
                    allTeachers: data.allTeachers,
                    allSubjects: data.allSubjects,
                  })}
                  dataKeys={["Classes", "Students", "Teachers", "Subjects"]}
                  colors={getChartColors(4)}
                />
                <BarChart
                  title="Top 10 Classes by Student Count"
                  description="Classes with the most students"
                  data={getStudentsPerClass(data.allClasses, data.allStudents)}
                  color={getChartColor(4)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
