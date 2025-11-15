import type { Route } from "./+types/edit";
import { TeacherForm } from "@/components/form/teacher";
import { userService } from "@/services/user-service";
import type { AuthUser } from "@/types/auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edit Teacher" },
    { name: "description", content: "Edit teacher information" },
  ];
}

export async function clientLoader({ params }: { params: { id: string } }) {
  const teacher = await userService.getById(params.id);
  return { teacher };
}

export function HydrateFallback() {
  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Teacher</h1>
        <p className="text-sm text-muted-foreground">Loading teacher data...</p>
      </div>
    </main>
  );
}

export default function EditTeacher({
  loaderData,
}: Route.ComponentProps) {
  const { teacher } = loaderData;

  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Teacher</h1>
        <p className="text-sm text-muted-foreground">
          Update teacher information
        </p>
      </div>

      <TeacherForm teacher={teacher} />
    </main>
  );
}

