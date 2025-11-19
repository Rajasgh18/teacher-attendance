import type { Route } from "./+types/new";
import { ClassForm } from "@/components/form/class";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New Class" },
    { name: "description", content: "Create a new class" },
  ];
}

export default function NewClass() {
  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">New Class</h1>
        <p className="text-sm text-muted-foreground">
          Create a new class record in the system
        </p>
      </div>

      <ClassForm />
    </main>
  );
}
