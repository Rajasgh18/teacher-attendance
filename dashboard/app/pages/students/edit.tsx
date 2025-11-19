import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { Route } from "./+types/edit";
import { StudentForm } from "@/components/form/student";
import { studentService } from "@/services/student-service";
import type { StudentEntity } from "@/types/student";
import { LucideLoader2 } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edit Student" },
    { name: "description", content: "Edit student information" },
  ];
}

export default function EditStudent() {
  const params = useParams();
  const id = params.id as string;
  const [student, setStudent] = useState<StudentEntity | null>(null);
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
        const data = await studentService.getById(id);
        setStudent(data);
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

  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Student</h1>
        <p className="text-sm text-muted-foreground">
          Update student information
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LucideLoader2 className="animate-spin size-6" />
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <StudentForm student={student} />
      )}
    </main>
  );
}
