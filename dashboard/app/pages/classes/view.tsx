import { useEffect, useState } from "react";
import type { Route } from "./+types/view";
import type { ClassEntity } from "@/types/class";
import type { StudentEntity } from "@/types/student";
import type { ClassTeacherAssignment } from "@/types/class";
import { useNavigate, useParams, Link } from "react-router";
import { classService } from "@/services/class-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import { StatusCell } from "@/components/status";
import {
  ArrowLeft,
  Calendar,
  Building2,
  Users,
  BookOpen,
  GraduationCap,
} from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Teacher Dashboard | View Class" },
    { name: "description", content: "View class information" },
  ];
}

export default function ClassView() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id as string;

  const [classEntity, setClassEntity] = useState<ClassEntity | null>(null);
  const [students, setStudents] = useState<StudentEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No class ID provided.");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const [classData, studentsData] = await Promise.all([
          classService.getById(id),
          classService.getStudents({ classId: id }),
          // classService.getTeachers({ classId: id }),
        ]);

        setClassEntity(classData);
        setStudents(studentsData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load class data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <main className="flex items-center justify-center h-full">
        <Loader />
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      </main>
    );
  }

  if (!classEntity) {
    return (
      <main className="p-6">
        <div className="rounded-md border p-4 text-sm">
          No class data found.
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-y-6 h-full p-6">
      <div className="flex gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/classes")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Grade {classEntity.grade} - Section {classEntity.section}
          </h1>
          <p className="text-sm text-muted-foreground">Class Details</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
            <CardDescription>Details about this class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="size-4 text-muted-foreground" />
                <span className="font-medium">Name:</span>
                <span>{classEntity.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="size-4 text-muted-foreground" />
                <span className="font-medium">Grade:</span>
                <span>{classEntity.grade}</span>
              </div>
              {classEntity.section && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Section:</span>
                  <span>{classEntity.section}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="font-medium">Academic Year:</span>
                <span>{classEntity.academicYear}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="size-4 text-muted-foreground" />
                <span className="font-medium">School:</span>
                <span>{classEntity.school.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Status:</span>
                <StatusCell
                  status={classEntity.isActive ? "active" : "inactive"}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Class statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="size-4 text-muted-foreground" />
                <span className="font-medium">Total Students:</span>
                <span>{students.length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="size-4 text-muted-foreground" />
                <span className="font-medium">Total Teachers:</span>
                <span>{teachers.length}</span>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Students */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Students</CardTitle>
                <CardDescription>
                  Students enrolled in this class
                </CardDescription>
              </div>
              {students.length > 0 && (
                <Link
                  to={`/students?classId=${id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  See All
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No students enrolled yet.
              </p>
            ) : (
              <div className="space-y-2">
                {students.slice(0, 5).map((student) => (
                  <div
                    key={student.id}
                    className="rounded-md border p-3 text-sm"
                  >
                    <Link
                      to={`/students/${student.id}`}
                      className="font-medium hover:underline text-primary"
                    >
                      {student.firstName} {student.lastName}
                    </Link>
                    {student.studentId && (
                      <div className="text-xs text-muted-foreground mt-1">
                        ID: {student.studentId}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teachers */}
        {/* <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assigned Teachers</CardTitle>
                <CardDescription>
                  Teachers assigned to this class
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {teachers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No teachers assigned yet.
              </p>
            ) : (
              <div className="space-y-2">
                {teachers.slice(0, 5).map((teacherAssignment) => (
                  <div
                    key={teacherAssignment.id}
                    className="rounded-md border p-3 text-sm"
                  >
                    {teacherAssignment.teacher ? (
                      <Link
                        to={`/teachers/${teacherAssignment.teacher.id}`}
                        className="font-medium hover:underline text-primary"
                      >
                        {teacherAssignment.teacher.firstName}{" "}
                        {teacherAssignment.teacher.lastName}
                      </Link>
                    ) : (
                      <span className="font-medium">Teacher ID: {teacherAssignment.teacherId}</span>
                    )}
                    {teacherAssignment.isPrimaryTeacher && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Primary Teacher
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card> */}
      </div>

      <div className="flex gap-2">
        <Button onClick={() => navigate(`/classes/${id}/edit`)}>
          Edit Class
        </Button>
        <Button variant="outline" onClick={() => navigate("/classes")}>
          Back to List
        </Button>
      </div>
    </main>
  );
}
