import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  subjectService,
  type CreateSubjectData,
  type UpdateSubjectData,
} from "@/services/subject-service";
import type { SubjectEntity } from "@/types/subject";

interface SubjectFormProps {
  subject?: SubjectEntity | null;
  onSuccess?: () => void;
}

export function SubjectForm({ subject, onSuccess }: SubjectFormProps) {
  const navigate = useNavigate();
  const isEditMode = !!subject;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateSubjectData>({
    name: subject?.name || "",
    code: subject?.code || "",
    description: subject?.description || "",
    isActive: subject?.isActive ?? true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEditMode && subject) {
        const updateData: UpdateSubjectData = {
          name: formData.name || undefined,
          code: formData.code || undefined,
          description: formData.description && formData.description.trim() ? formData.description.trim() : null,
          isActive: formData.isActive,
        };
        await subjectService.update(subject.id, updateData);
      } else {
        await subjectService.create(formData);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/subjects");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save subject");
    } finally {
      setLoading(false);
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
          <CardTitle>{isEditMode ? "Edit Subject" : "New Subject"}</CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update subject information"
              : "Fill in the details to create a new subject"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">
                  Subject Name <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Mathematics"
                    required
                    disabled={loading}
                  />
                  <FieldDescription>
                    Full name of the subject
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="code">
                  Subject Code <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g., MATH101"
                    required
                    disabled={loading}
                  />
                  <FieldDescription>
                    Unique code for the subject (e.g., MATH101, ENG201)
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <FieldContent>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    placeholder="Brief description of the subject"
                    disabled={loading}
                    rows={3}
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  />
                  <FieldDescription>
                    Optional description of the subject
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
                        disabled={loading}
                        className="h-4 w-4 rounded border-input"
                      />
                      <span className="text-sm">Active</span>
                    </label>
                    <FieldDescription>
                      Inactive subjects will not appear in lists
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
          onClick={() => navigate("/subjects")}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : isEditMode
              ? "Update Subject"
              : "Create Subject"}
        </Button>
      </div>
    </form>
  );
}

