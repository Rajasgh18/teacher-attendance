import type { Route } from "./+types/new";
import { SubjectForm } from "@/components/form/subject";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New Subject" },
    { name: "description", content: "Create a new subject" },
  ];
}

export default function NewSubject() {
  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">New Subject</h1>
        <p className="text-sm text-muted-foreground">
          Create a new subject record in the system
        </p>
      </div>

      <SubjectForm />
    </main>
  );
}

