import { useEffect, useState } from "react";
import type { Route } from "./+types/view";
import type { User } from "@/types/auth";
import { useParams, useNavigate, Link } from "react-router";
import { userService } from "@/services/user-service";
import { classService } from "@/services/class-service";
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
  Clock,
} from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Teacher Dashboard | View Teacher" },
    { name: "description", content: "View teacher details" },
  ];
}

export default function ViewTeacher() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id as string;

  const [teacher, setTeacher] = useState<User | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No teacher ID provided.");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const teacherData = await userService.getById(id);
        setTeacher(teacherData);

        // Fetch related data
        try {
          const attendanceData = await attendanceService
            .listTeacher({ page: 1, limit: 5 })
            .catch(() => ({ data: [], pagination: { total: 0 } }));

          // Filter attendance for this teacher
          const teacherAttendance = attendanceData.data.filter(
            (a: any) => a.teacherId === id,
          );
          setRecentAttendance(teacherAttendance.slice(0, 5));

          // Note: Classes assignment data would need a separate endpoint
          // For now, we'll leave it empty or fetch from a different source
          setClasses([]);
        } catch (e) {
          console.error("Error fetching related data:", e);
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to load teacher data.",
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

  if (!teacher) {
    return (
      <main className="p-6">
        <div className="rounded-md border p-4 text-sm">
          No teacher data found.
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-y-6 h-full p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/teachers")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {teacher.firstName} {teacher.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">Teacher Details</p>
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
                <Building2 className="size-4 text-muted-foreground" />
                <span className="font-medium">Employee ID:</span>
                <span>{teacher.employeeId}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="size-4 text-muted-foreground" />
                <span className="font-medium">Role:</span>
                <span className="capitalize">{teacher.role}</span>
              </div>
              {teacher.department && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="size-4 text-muted-foreground" />
                  <span className="font-medium">Department:</span>
                  <span>{teacher.department}</span>
                </div>
              )}
              {teacher.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{teacher.email}</span>
                </div>
              )}
              {teacher.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                  <span>{teacher.phone}</span>
                </div>
              )}
              {teacher.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="font-medium">Address:</span>
                  <span>{teacher.address}</span>
                </div>
              )}
              {teacher.hireDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="font-medium">Hire Date:</span>
                  <span>{new Date(teacher.hireDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Status:</span>
                <StatusCell status={teacher.isActive ? "active" : "inactive"} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* School Information */}
        {teacher.school && (
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>Associated school details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="size-4 text-muted-foreground" />
                  <span className="font-medium">School:</span>
                  <span>{teacher.school.name}</span>
                </div>
                {teacher.school.code && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Code:</span>
                    <span>{teacher.school.code}</span>
                  </div>
                )}
                {teacher.school.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span className="font-medium">Address:</span>
                    <span>{teacher.school.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned Classes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assigned Classes</CardTitle>
                <CardDescription>
                  Classes this teacher is assigned to
                </CardDescription>
              </div>
              {classes.length > 0 && (
                <Link
                  to={`/classes`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  See All
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No classes assigned yet.
              </p>
            ) : (
              <div className="space-y-2">
                {classes.slice(0, 5).map((classAssignment: any) => (
                  <div
                    key={classAssignment.id}
                    className="rounded-md border p-3 text-sm"
                  >
                    <div className="font-medium">
                      {classAssignment.classId
                        ? `Class ID: ${classAssignment.classId}`
                        : "Class Assignment"}
                    </div>
                    {classAssignment.isPrimaryTeacher && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Primary Teacher
                      </div>
                    )}
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
                  to={`/attendance?tab=teacher&teacherId=${id}`}
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
                {recentAttendance.map((att: any) => (
                  <div key={att.id} className="rounded-md border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        <span>
                          {new Date(att.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <StatusCell status={att.status} />
                    </div>
                    {att.checkIn !== undefined && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Check-in: {att.checkIn ? "Yes" : "No"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => navigate(`/teachers/${id}/edit`)}>
          Edit Teacher
        </Button>
        <Button variant="outline" onClick={() => navigate("/teachers")}>
          Back to List
        </Button>
      </div>
    </main>
  );
}
