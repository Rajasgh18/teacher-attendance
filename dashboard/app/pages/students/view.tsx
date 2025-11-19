import { useEffect, useState } from "react";
import type { Route } from "./+types/view";
import type { StudentEntity } from "@/types/student";
import type { MarksEntity } from "@/types/marks";
import type { StudentAttendanceEntity } from "@/types/attendance";
import { useParams, useNavigate, Link } from "react-router";
import { studentService } from "@/services/student-service";
import { marksService } from "@/services/marks-service";
import { attendanceService } from "@/services/attendance-service";
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
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Users,
  BookOpen,
  Clock,
} from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Teacher Dashboard | View Student" },
    { name: "description", content: "View student details" },
  ];
}

export default function ViewStudent() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id as string;

  const [student, setStudent] = useState<StudentEntity | null>(null);
  const [recentMarks, setRecentMarks] = useState<MarksEntity[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<
    StudentAttendanceEntity[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No student ID provided.");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const studentData = await studentService.getById(id);
        setStudent(studentData);

        // Fetch related data
        try {
          const [marksData, attendanceData] = await Promise.all([
            marksService
              .list({ page: 1, limit: 5, studentId: id })
              .catch(() => ({
                data: [],
                pagination: { total: 0 },
              })),
            attendanceService
              .listStudent({ page: 1, limit: 5 })
              .catch(() => ({ data: [], pagination: { total: 0 } })),
          ]);

          // Filter marks for this student
          const studentMarks = marksData.data.filter((m) => m.studentId === id);
          setRecentMarks(studentMarks);

          // Filter attendance for this student
          const studentAttendance = attendanceData.data.filter(
            (a) => a.studentId === id,
          );
          setRecentAttendance(studentAttendance);
        } catch (e) {
          console.error("Error fetching related data:", e);
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to load student data.",
        );
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

  if (!student) {
    return (
      <main className="p-6">
        <div className="rounded-md border p-4 text-sm">
          No student data found.
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-y-6 h-full p-6">
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/students")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {student.firstName}
          </h1>
          <p className="text-sm text-muted-foreground">Student Details</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Personal and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="size-4 text-muted-foreground" />
                <span className="font-medium">Student ID:</span>
                <span>{student.studentId || "-"}</span>
              </div>
              {student.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{student.email}</span>
                </div>
              )}
              {student.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                  <span>{student.phone}</span>
                </div>
              )}
              {student.dateOfBirth && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="font-medium">Date of Birth:</span>
                  <span>
                    {new Date(student.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Gender:</span>
                <span className="capitalize">{student.gender}</span>
              </div>
              {student.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="font-medium">Address:</span>
                  <span>{student.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Status:</span>
                <StatusCell status={student.isActive ? "active" : "inactive"} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class & School Information */}
        <Card>
          <CardHeader>
            <CardTitle>Class & School Information</CardTitle>
            <CardDescription>Academic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="size-4 text-muted-foreground" />
                <span className="font-medium">Class:</span>
                <Link
                  to={`/classes/${student.classId}`}
                  className="text-primary hover:underline"
                >
                  {student.class.name}
                </Link>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="size-4 text-muted-foreground" />
                <span className="font-medium">School:</span>
                <span>{student.school.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Marks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Marks</CardTitle>
                <CardDescription>
                  Latest marks entries for this student
                </CardDescription>
              </div>
              {recentMarks.length > 0 && (
                <Link
                  to={`/marks?studentId=${id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  See All
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recentMarks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No marks entries found.
              </p>
            ) : (
              <div className="space-y-2">
                {recentMarks.map((mark) => (
                  <div key={mark.id} className="rounded-md border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{mark.subject.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {mark.month} - {mark.marks} marks
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>Latest attendance records</CardDescription>
              </div>
              {recentAttendance.length > 0 && (
                <Link
                  to={`/attendance?tab=student&studentId=${id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  See All
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No attendance records found.
              </p>
            ) : (
              <div className="space-y-2">
                {recentAttendance.map((att) => (
                  <div key={att.id} className="rounded-md border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        <span>{new Date(att.date).toLocaleDateString()}</span>
                      </div>
                      <StatusCell status={att.status} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Marked by: {att.markedByUser.firstName}{" "}
                      {att.markedByUser.lastName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => navigate(`/students/${id}/edit`)}>
          Edit Student
        </Button>
        <Button variant="outline" onClick={() => navigate("/students")}>
          Back to List
        </Button>
      </div>
    </main>
  );
}
