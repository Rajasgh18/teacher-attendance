import { useEffect, useState } from "react";
import type { Route } from "./+types/view";
import type { SubjectEntity } from "@/types/subject";
import type { MarksEntity } from "@/types/marks";
import { useParams, useNavigate, Link } from "react-router";
import { subjectService } from "@/services/subject-service";
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
import { StatusCell } from "@/components/status";
import { ArrowLeft, BookOpen, Calendar, Users } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Teacher Dashboard | View Subject" },
    { name: "description", content: "View subject details" },
  ];
}

export default function ViewSubject() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id as string;

  const [subject, setSubject] = useState<SubjectEntity | null>(null);
  const [recentMarks, setRecentMarks] = useState<MarksEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No subject ID provided.");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const subjectData = await subjectService.getById(id);
        setSubject(subjectData);

        // Fetch related marks
        try {
          const marksData = await marksService.list({
            page: 1,
            limit: 5,
            subjectId: id,
          });

          setRecentMarks(marksData.data);
        } catch (e) {
          console.error("Error fetching marks:", e);
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to load subject data.",
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

  if (!subject) {
    return (
      <main className="p-6">
        <div className="rounded-md border p-4 text-sm">
          No subject data found.
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
          onClick={() => navigate("/subjects")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {subject.name}
          </h1>
          <p className="text-sm text-muted-foreground">Subject Details</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Information</CardTitle>
            <CardDescription>Details about this subject</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="size-4 text-muted-foreground" />
                <span className="font-medium">Name:</span>
                <span>{subject.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Code:</span>
                <span>{subject.code}</span>
              </div>
              {subject.description && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-medium">Description:</span>
                  <span className="flex-1">{subject.description}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Status:</span>
                <StatusCell status={subject.isActive ? "active" : "inactive"} />
              </div>
              {subject.createdAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="font-medium">Created:</span>
                  <span>
                    {new Date(subject.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
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
                  Latest marks entries for this subject
                </CardDescription>
              </div>
              {recentMarks.length > 0 && (
                <Link
                  to={`/marks?subjectId=${id}`}
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
                No marks entries found for this subject.
              </p>
            ) : (
              <div className="space-y-2">
                {recentMarks.map((mark) => (
                  <div key={mark.id} className="rounded-md border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          to={`/students/${mark.studentId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {mark.student.firstName} {mark.student.lastName}
                        </Link>
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
      </div>

      <div className="flex gap-2">
        <Button onClick={() => navigate(`/subjects/${id}/edit`)}>
          Edit Subject
        </Button>
        <Button variant="outline" onClick={() => navigate("/subjects")}>
          Back to List
        </Button>
      </div>
    </main>
  );
}
