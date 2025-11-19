import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { Route } from "./+types/edit";
import { TeacherForm } from "@/components/form/teacher";
import { userService } from "@/services/user-service";
import type { User } from "@/types/auth";
import { LucideLoader2 } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edit Teacher" },
    { name: "description", content: "Edit teacher information" },
  ];
}

export default function EditTeacher() {
  const params = useParams();
  const id = params.id as string;
  const [teacher, setTeacher] = useState<User | null>(null);
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
        const data = await userService.getById(id);
        setTeacher(data);
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

  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Teacher</h1>
        <p className="text-sm text-muted-foreground">
          Update teacher information
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
        <TeacherForm teacher={teacher} />
      )}
    </main>
  );
}
