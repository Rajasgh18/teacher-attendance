import type { Route } from "./+types/edit";
import { SubjectForm } from "@/components/form/subject";
import { subjectService } from "@/services/subject-service";
import type { SubjectEntity } from "@/types/subject";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edit Subject" },
    { name: "description", content: "Edit subject information" },
  ];
}

export async function clientLoader({ params }: { params: { id: string } }) {
  const subject = await subjectService.getById(params.id);
  return { subject };
}

export function HydrateFallback() {
  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Subject</h1>
        <p className="text-sm text-muted-foreground">Loading subject data...</p>
      </div>
    </main>
  );
}

export default function EditSubject({
  loaderData,
}: Route.ComponentProps) {
  const { subject } = loaderData;

  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Subject</h1>
        <p className="text-sm text-muted-foreground">
          Update subject information
        </p>
      </div>

      <SubjectForm subject={subject} />
    </main>
  );
}

