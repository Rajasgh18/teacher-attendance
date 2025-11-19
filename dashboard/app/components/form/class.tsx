import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  classService,
  type CreateClassData,
  type UpdateClassData,
} from "@/services/class-service";
import type { ClassEntity } from "@/types/class";
import { useAuth } from "@/providers/auth-provider";
import type { SchoolEntity } from "@/types/school";
import { schoolService } from "@/services/school-service";

interface ClassFormProps {
  classEntity?: ClassEntity | null;
  onSuccess?: () => void;
}

export function ClassForm({ classEntity, onSuccess }: ClassFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!classEntity;

  const [error, setError] = useState<string | null>(null);
  const [schools, setSchools] = useState<SchoolEntity[]>([]);
  const [loading, setLoading] = useState({
    form: false,
    school: true,
  });

  const [formData, setFormData] = useState<CreateClassData>({
    name: classEntity?.name || "",
    grade: classEntity?.grade || "",
    section: classEntity?.section || "",
    academicYear: classEntity?.academicYear || "",
    schoolId: classEntity?.schoolId || user?.schoolId || "",
    isActive: classEntity?.isActive ?? true,
  });

  useEffect(() => {
    if (user?.role === "admin") {
      setLoading((prev) => ({ ...prev, school: true }));
      schoolService
        .list({ limit: 10000000 })
        .then((schoolsData) => {
          setSchools(schoolsData.data);
          setLoading((prev) => ({ ...prev, school: false }));
        })
        .catch((error) => setError(error))
        .finally(() => setLoading((prev) => ({ ...prev, school: false })));
    } else {
      setLoading((prev) => ({ ...prev, school: false }));
    }

    if (!classEntity && user?.role === "principal" && user.schoolId) {
      setFormData((prev) => ({ ...prev, schoolId: user.schoolId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading((prev) => ({ ...prev, form: true }));

    try {
      if (isEditMode && classEntity) {
        const updateData: UpdateClassData = {
          name: formData.name || undefined,
          grade: formData.grade || undefined,
          section: formData.section || undefined,
          academicYear: formData.academicYear || undefined,
          isActive: formData.isActive,
        };
        await classService.update(classEntity.id, updateData);
      } else {
        await classService.create(formData);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/classes");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save class");
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Class" : "New Class"}</CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update class information"
              : "Fill in the details to create a new class"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="schoolId">
                  School <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={formData.schoolId || undefined}
                    onValueChange={(value) =>
                      handleSelectChange("schoolId", value)
                    }
                    disabled={loading.form || !!user?.schoolId}
                    required
                  >
                    <SelectTrigger id="schoolId" className="w-full">
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {!loading.school &&
                        schools.map((sch) => (
                          <SelectItem key={sch.id} value={sch.id}>
                            {sch.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Select the school this class belongs to
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="name">
                  Class Name <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Grade 10-A"
                    required
                    disabled={loading.form}
                  />
                  <FieldDescription>
                    Name of the class (e.g., Grade 10-A, Class 5B)
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field orientation="responsive">
                <Field>
                  <FieldLabel htmlFor="grade">
                    Grade <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="grade"
                      name="grade"
                      type="text"
                      value={formData.grade}
                      onChange={handleChange}
                      placeholder="e.g., 10"
                      required
                      disabled={loading.form}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="section">Section</FieldLabel>
                  <FieldContent>
                    <Input
                      id="section"
                      name="section"
                      type="text"
                      value={formData.section}
                      onChange={handleChange}
                      placeholder="e.g., A"
                      disabled={loading.form}
                    />
                  </FieldContent>
                </Field>
              </Field>

              <Field>
                <FieldLabel htmlFor="academicYear">
                  Academic Year <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="academicYear"
                    name="academicYear"
                    type="text"
                    value={formData.academicYear}
                    onChange={handleChange}
                    placeholder="e.g., 2024-2025"
                    required
                    disabled={loading.form}
                  />
                  <FieldDescription>
                    Academic year for this class (e.g., 2024-2025)
                  </FieldDescription>
                </FieldContent>
              </Field>

              {isEditMode && (
                <Field>
                  <FieldLabel htmlFor="isActive">Status</FieldLabel>
                  <FieldContent>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                        disabled={loading.form}
                        className="h-4 w-4 rounded border-input"
                      />
                      <span className="text-sm">Active</span>
                    </label>
                    <FieldDescription>
                      Inactive classes will not appear in lists
                    </FieldDescription>
                  </FieldContent>
                </Field>
              )}
            </FieldGroup>
          </FieldSet>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/classes")}
          disabled={loading.form}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading.form || loading.school}>
          {loading.form
            ? "Saving..."
            : isEditMode
              ? "Update Class"
              : "Create Class"}
        </Button>
      </div>
    </form>
  );
}
