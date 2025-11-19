import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { Route } from "./+types/edit";
import { ClassForm } from "@/components/form/class";
import { classService } from "@/services/class-service";
import type { ClassEntity } from "@/types/class";
import { LucideLoader2 } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Teacher Dashboard | Edit Class" },
    { name: "description", content: "Edit class information" },
  ];
}

export default function EditClass() {
  const params = useParams();
  const id = params.id as string;
  const [classEntity, setClassEntity] = useState<ClassEntity | null>(null);
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
        const data = await classService.getById(id);
        setClassEntity(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load class data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Class</h1>
        <p className="text-sm text-muted-foreground">
          Update class information
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
        <ClassForm classEntity={classEntity} />
      )}
    </main>
  );
}
