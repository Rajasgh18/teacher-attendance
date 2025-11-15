import { useEffect, useState } from "react";
import type { Route } from "./+types/edit";
import { StudentForm } from "@/components/form/student";
import { studentService } from "@/services/student-service";
import type { StudentEntity } from "@/types/student";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edit Student" },
    { name: "description", content: "Edit student information" },
  ];
}

export async function clientLoader({ params }: { params: { id: string } }) {
  const student = await studentService.getById(params.id);
  return { student };
}

export function HydrateFallback() {
  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Student</h1>
        <p className="text-sm text-muted-foreground">Loading student data...</p>
      </div>
    </main>
  );
}

export default function EditStudent({
  loaderData,
}: Route.ComponentProps) {
  const { student } = loaderData;

  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Student</h1>
        <p className="text-sm text-muted-foreground">
          Update student information
        </p>
      </div>

      <StudentForm student={student} />
    </main>
  );
}

