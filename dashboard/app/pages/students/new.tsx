import type { Route } from "./+types/new";
import { StudentForm } from "@/components/form/student";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New Student" },
    { name: "description", content: "Create a new student" },
  ];
}

export default function NewStudent() {
  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">New Student</h1>
        <p className="text-sm text-muted-foreground">
          Create a new student record in the system
        </p>
      </div>

      <StudentForm />
    </main>
  );
}
