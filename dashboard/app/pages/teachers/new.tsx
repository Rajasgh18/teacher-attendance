import type { Route } from "./+types/new";
import { TeacherForm } from "@/components/form/teacher";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New Teacher" },
    { name: "description", content: "Create a new teacher" },
  ];
}

export default function NewTeacher() {
  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">New Teacher</h1>
        <p className="text-sm text-muted-foreground">
          Create a new teacher account in the system
        </p>
      </div>

      <TeacherForm />
    </main>
  );
}

