import { useState, useEffect } from "react";
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
  userService,
  type CreateTeacherData,
  type UpdateTeacherData,
} from "@/services/user-service";
import type { AuthUser } from "@/types/auth";
import { useAuth } from "@/providers/auth-provider";
import type { SchoolEntity } from "@/types/school";
import { schoolService } from "@/services/school-service";

interface TeacherFormProps {
  teacher?: AuthUser | null;
  onSuccess?: () => void;
}

export function TeacherForm({ teacher, onSuccess }: TeacherFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!teacher;

  const [error, setError] = useState<string | null>(null);
  const [schools, setSchools] = useState<SchoolEntity[]>([]);
  const [loading, setLoading] = useState({
    form: false,
    school: true,
  });

  const [formData, setFormData] = useState<CreateTeacherData>({
    firstName: teacher?.firstName || "",
    lastName: teacher?.lastName || "",
    email: teacher?.email || "",
    employeeId: teacher?.employeeId || "",
    role: (teacher?.role as "admin" | "teacher") || "teacher",
    department: teacher?.department || "",
    phone: teacher?.phone || "",
    address: teacher?.address || "",
    hireDate: teacher?.hireDate ? teacher.hireDate.split("T")[0] : "",
    schoolId: teacher?.schoolId || user?.schoolId || "",
    password: "",
    isActive: teacher?.isActive ?? true,
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

  }, [user]);

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
      if (isEditMode && teacher) {
        const updateData: UpdateTeacherData = {
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          email: formData.email || undefined,
          employeeId: formData.employeeId || undefined,
          role: formData.role,
          department: formData.department || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          hireDate: formData.hireDate || undefined,
          isActive: formData.isActive,
        };
        await userService.update(teacher.id, updateData);
      } else {
        await userService.create(formData);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/teachers");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save teacher");
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
          <CardTitle>{isEditMode ? "Edit Teacher" : "New Teacher"}</CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update teacher information"
              : "Fill in the details to create a new teacher account"}
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
                    onValueChange={(value) => handleSelectChange("schoolId", value)}
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
                    Select the school this teacher belongs to
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field orientation="responsive">
                <Field>
                  <FieldLabel htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      required
                      disabled={loading.form}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      required
                      disabled={loading.form}
                    />
                  </FieldContent>
                </Field>
              </Field>

              <Field>
                <FieldLabel htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="teacher@example.com"
                    required
                    disabled={loading.form}
                  />
                  <FieldDescription>Teacher's email address</FieldDescription>
                </FieldContent>
              </Field>

              <Field orientation="responsive">
                <Field>
                  <FieldLabel htmlFor="employeeId">
                    Employee ID <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="employeeId"
                      name="employeeId"
                      type="text"
                      value={formData.employeeId}
                      onChange={handleChange}
                      placeholder="e.g., EMP001"
                      required
                      disabled={loading.form}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="role">
                    Role <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        handleSelectChange("role", value)
                      }
                      disabled={loading.form}
                      required
                    >
                      <SelectTrigger id="role" className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="principal">Principal</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              </Field>

              <Field>
                <FieldLabel htmlFor="department">
                  Department <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="department"
                    name="department"
                    type="text"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g., Mathematics"
                    required
                    disabled={loading.form}
                  />
                  <FieldDescription>
                    Department or subject area
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field orientation="responsive">
                <Field>
                  <FieldLabel htmlFor="phone">
                    Phone <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                      required
                      disabled={loading.form}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="hireDate">
                    Hire Date <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="hireDate"
                      name="hireDate"
                      type="date"
                      value={formData.hireDate}
                      onChange={handleChange}
                      required
                      disabled={loading.form}
                    />
                  </FieldContent>
                </Field>
              </Field>

              <Field>
                <FieldLabel htmlFor="address">
                  Address <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main Street, City, State, ZIP Code"
                    required
                    disabled={loading.form}
                    rows={3}
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  />
                  <FieldDescription>
                    Teacher's residential address
                  </FieldDescription>
                </FieldContent>
              </Field>

              {!isEditMode && (
                <Field>
                  <FieldLabel htmlFor="password">
                    Password <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      required
                      disabled={loading.form}
                    />
                    <FieldDescription>
                      Initial password for the teacher account
                    </FieldDescription>
                  </FieldContent>
                </Field>
              )}

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
                      Inactive teachers will not appear in lists
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
          onClick={() => navigate("/teachers")}
          disabled={loading.form}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading.form || loading.school}>
          {loading.form
            ? "Saving..."
            : isEditMode
              ? "Update Teacher"
              : "Create Teacher"}
        </Button>
      </div>
    </form>
  );
}

