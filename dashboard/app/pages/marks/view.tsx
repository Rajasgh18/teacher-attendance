import { useEffect, useState } from "react";
import type { Route } from "./+types/view";
import type { MarksEntity } from "@/types/marks";
import { useParams, useNavigate, Link, useSearchParams } from "react-router";
import { marksService } from "@/services/marks-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  User,
  GraduationCap,
  Building2,
} from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Teacher Dashboard | View Marks" },
    { name: "description", content: "View marks information" },
  ];
}

export default function MarksView() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id as string;

  const [marksEntity, setMarksEntity] = useState<MarksEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No marks ID provided.");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const data = await marksService.getById(id);
        setMarksEntity(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load marks data.");
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

  if (!marksEntity) {
    return (
      <main className="p-6">
        <div className="rounded-md border p-4 text-sm">
          No marks data found.
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-y-6 h-full p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/marks")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">View Marks</h1>
          <p className="text-sm text-muted-foreground">Marks Details</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Student details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="size-4 text-muted-foreground" />
                <span className="font-medium">Student:</span>
                <Link
                  to={`/students/${marksEntity.student.id}`}
                  className="text-primary hover:underline"
                >
                  {marksEntity.student.firstName} {marksEntity.student.lastName}
                </Link>
              </div>
              {marksEntity.student.studentId && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Student ID:</span>
                  <span>{marksEntity.student.studentId}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="size-4 text-muted-foreground" />
                <span className="font-medium">Class:</span>
                <Link
                  to={`/classes/${marksEntity.student.classId}`}
                  className="text-primary hover:underline"
                >
                  {marksEntity.class.name}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject & Marks Information */}
        <Card>
          <CardHeader>
            <CardTitle>Subject & Marks</CardTitle>
            <CardDescription>Marks details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="size-4 text-muted-foreground" />
                <span className="font-medium">Subject:</span>
                <Link
                  to={`/subjects/${marksEntity.subject.id}`}
                  className="text-primary hover:underline"
                >
                  {marksEntity.subject.name}
                </Link>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Subject Code:</span>
                <span>{marksEntity.subject.code}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="size-4 text-muted-foreground" />
                <span className="font-medium">Marks:</span>
                <span className="text-lg font-semibold">
                  {marksEntity.marks}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="font-medium">Month:</span>
                <span>{marksEntity.month}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* School Information */}
        <Card>
          <CardHeader>
            <CardTitle>School Information</CardTitle>
            <CardDescription>School details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="size-4 text-muted-foreground" />
                <span className="font-medium">School:</span>
                <span>{marksEntity.school.name}</span>
              </div>
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
              {marksEntity.createdAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="font-medium">Created:</span>
                  <span>
                    {new Date(marksEntity.createdAt).toLocaleString()}
                  </span>
                </div>
              )}
              {marksEntity.updatedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="font-medium">Updated:</span>
                  <span>
                    {new Date(marksEntity.updatedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate("/marks")}>
          Back to List
        </Button>
      </div>
    </main>
  );
}
