import { useEffect, useState } from "react";
import type { Route } from "./+types/view";
import type {
  TeacherAttendanceEntity,
  StudentAttendanceEntity,
} from "@/types/attendance";
import { useParams, useSearchParams, useNavigate, Link } from "react-router";
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
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Teacher Dashboard | View Attendance" },
    { name: "description", content: "View attendance information" },
  ];
}

export default function AttendanceView() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = params.id as string;
  const tab = searchParams.get("tab") || "teacher";

  const [attendanceEntity, setAttendanceEntity] = useState<
    TeacherAttendanceEntity | StudentAttendanceEntity | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No attendance ID provided.");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const data = await attendanceService.getByAttendanceId(
          id,
          tab as "teacher" | "student"
        );

        setAttendanceEntity(data);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to load attendance data."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, tab]);

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

  if (!attendanceEntity) {
    return (
      <main className="p-6">
        <div className="rounded-md border p-4 text-sm">
          No attendance data found.
        </div>
      </main>
    );
  }

  const isTeacherAttendance = "teacherId" in attendanceEntity;

  return (
    <main className="flex flex-col gap-y-6 h-full p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/attendance")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            View Attendance
          </h1>
          <p className="text-sm text-muted-foreground">
            {isTeacherAttendance ? "Teacher" : "Student"} Attendance Details
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Information</CardTitle>
            <CardDescription>
              {isTeacherAttendance ? "Teacher" : "Student"} attendance record
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {isTeacherAttendance && "teacher" in attendanceEntity && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="size-4 text-muted-foreground" />
                    <span className="font-medium">Teacher:</span>
                    <Link
                      to={`/teachers/${attendanceEntity.teacher.id}`}
                      className="text-primary hover:underline"
                    >
                      {attendanceEntity.teacher.firstName}{" "}
                      {attendanceEntity.teacher.lastName}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Employee ID:</span>
                    <span>{attendanceEntity.teacher.employeeId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {attendanceEntity.checkIn ? (
                      <CheckCircle className="size-4 text-green-500" />
                    ) : (
                      <XCircle className="size-4 text-red-500" />
                    )}
                    <span className="font-medium">Check-In:</span>
                    <span>{attendanceEntity.checkIn ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span className="font-medium">Location:</span>
                    <span>
                      {Number(attendanceEntity.latitude).toFixed(4)},{" "}
                      {Number(attendanceEntity.longitude).toFixed(4)}
                    </span>
                  </div>
                </>
              )}

              {!isTeacherAttendance && "student" in attendanceEntity && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="size-4 text-muted-foreground" />
                    <span className="font-medium">Student:</span>
                    <Link
                      to={`/students/${attendanceEntity.student.id}`}
                      className="text-primary hover:underline"
                    >
                      {attendanceEntity.student.firstName}{" "}
                      {attendanceEntity.student.lastName}
                    </Link>
                  </div>
                  {attendanceEntity.student.studentId && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Student ID:</span>
                      <span>{attendanceEntity.student.studentId}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span className="font-medium">Date:</span>
                    <span>
                      {new Date(attendanceEntity.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="size-4 text-muted-foreground" />
                    <span className="font-medium">Marked By:</span>
                    <Link
                      to={`/teachers/${attendanceEntity.markedByUser.id}`}
                      className="text-primary hover:underline"
                    >
                      {attendanceEntity.markedByUser.firstName}{" "}
                      {attendanceEntity.markedByUser.lastName}
                    </Link>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Status:</span>
                <StatusCell status={attendanceEntity.status} />
              </div>

              {attendanceEntity.notes && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-medium">Notes:</span>
                  <span className="flex-1">{attendanceEntity.notes}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
            <CardDescription>Record creation and update times</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {attendanceEntity.createdAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="font-medium">Created:</span>
                  <span>
                    {new Date(attendanceEntity.createdAt).toLocaleString()}
                  </span>
                </div>
              )}
              {attendanceEntity.updatedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="font-medium">Updated:</span>
                  <span>
                    {new Date(attendanceEntity.updatedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate("/attendance")}>
          Back to List
        </Button>
      </div>
    </main>
  );
}
