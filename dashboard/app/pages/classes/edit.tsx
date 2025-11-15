import type { Route } from "./+types/edit";
import { ClassForm } from "@/components/form/class";
import { classService } from "@/services/class-service";
import type { ClassEntity } from "@/types/class";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edit Class" },
    { name: "description", content: "Edit class information" },
  ];
}

export async function clientLoader({ params }: { params: { id: string } }) {
  const classEntity = await classService.getById(params.id);
  return { classEntity };
}

export function HydrateFallback() {
  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Class</h1>
        <p className="text-sm text-muted-foreground">Loading class data...</p>
      </div>
    </main>
  );
}

export default function EditClass({
  loaderData,
}: Route.ComponentProps) {
  const { classEntity } = loaderData;

  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Class</h1>
        <p className="text-sm text-muted-foreground">
          Update class information
        </p>
      </div>

      <ClassForm classEntity={classEntity} />
    </main>
  );
}

