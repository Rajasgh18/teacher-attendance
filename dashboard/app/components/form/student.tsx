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
  studentService,
  type CreateStudentData,
  type UpdateStudentData,
} from "@/services/student-service";
import { classService } from "@/services/class-service";
import type { StudentEntity } from "@/types/student";
import type { ClassEntity } from "@/types/class";
import { useAuth } from "@/providers/auth-provider";
import type { SchoolEntity } from "@/types/school";
import { schoolService } from "@/services/school-service";
import { LucideLoader2 } from "lucide-react";

interface StudentFormProps {
  student?: StudentEntity | null;
  onSuccess?: () => void;
}

interface StudentLoading {
  form: boolean;
  class: boolean;
  school: boolean;
}

export function StudentForm({ student, onSuccess }: StudentFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!student;

  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [schools, setSchools] = useState<SchoolEntity[]>([]);
  const [loading, setLoading] = useState<StudentLoading>({
    form: false,
    class: false,
    school: true,
  });

  const [formData, setFormData] = useState<CreateStudentData>({
    studentId: student?.studentId || "",
    firstName: student?.firstName || "",
    lastName: student?.lastName || "",
    email: student?.email || "",
    phone: student?.phone || "",
    address: student?.address || "",
    dateOfBirth: student?.dateOfBirth ? student.dateOfBirth.split("T")[0] : "",
    gender: student?.gender || "male",
    classId: student?.classId || "",
    schoolId: student?.schoolId || "",
    isActive: student?.isActive ?? true,
  });

  useEffect(() => {
    setLoading({ ...loading, class: true });
    classService
      .list({ schoolId: formData.schoolId, limit: 10000000 })
      .then((classData) => setClasses(classData.data))
      .catch((error) => setError(error))
      .finally(() => setLoading({ ...loading, class: false }));
  }, [formData.schoolId]);

  useEffect(() => {
    if (user?.role === "admin") {
      schoolService
        .list({limit: 10000000})
        .then((schoolsData) => {
          setSchools(schoolsData.data);
          setLoading({...loading, school: false})
        })
        .catch((error) => setError(error))
        .finally(() => setLoading({ ...loading, school: false }));
    }

    if (!student && user?.role === "principal" && user.schoolId) {
      setFormData({ ...formData, schoolId: user.schoolId });
    }
  }, []);

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
    setLoading({ ...loading, form: true });

    try {
      if (isEditMode && student) {
        const updateData: UpdateStudentData = {
          studentId: formData.studentId || undefined,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          gender: formData.gender,
          schoolId: formData.schoolId,
          classId: formData.classId || undefined,
          isActive: formData.isActive,
        };
        await studentService.update(student.id, updateData);
      } else {
        await studentService.create(formData);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/students");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save student");
    } finally {
      setLoading({ ...loading, form: false });
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
          <CardTitle>{isEditMode ? "Edit Student" : "New Student"}</CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update student information"
              : "Fill in the details to create a new student"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="studentId">
                  Student ID <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="studentId"
                    name="studentId"
                    type="text"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="e.g., STU001"
                    required
                    maxLength={50}
                    disabled={loading.form}
                  />
                  <FieldDescription>
                    Unique identifier for the student (max 50 characters)
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
                      maxLength={100}
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
                      maxLength={100}
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
                    placeholder="student@example.com"
                    required
                    maxLength={255}
                    disabled={loading.form}
                  />
                  <FieldDescription>Student's email address</FieldDescription>
                </FieldContent>
              </Field>

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
                    maxLength={20}
                    disabled={loading.form}
                  />
                  <FieldDescription>
                    Contact phone number (max 20 characters)
                  </FieldDescription>
                </FieldContent>
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
                    Student's residential address
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field orientation="responsive">
                <Field>
                  <FieldLabel htmlFor="dateOfBirth">
                    Date of Birth <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                      disabled={loading.form}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="gender">
                    Gender <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={formData.gender || undefined}
                      onValueChange={(value) =>
                        handleSelectChange("gender", value)
                      }
                      disabled={loading.form}
                      required
                    >
                      <SelectTrigger id="gender" className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              </Field>

              <Field>
                <FieldLabel htmlFor="classId">
                  School <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={formData.schoolId}
                    onValueChange={(value) => {
                      handleSelectChange("schoolId", value);
                    }}
                    disabled={loading.form}
                    required
                  >
                    <SelectTrigger
                      disabled={!!user?.schoolId}
                      id="schoolId"
                      className="w-full"
                    >
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {!loading.school &&
                        schools.map((sch, i) => (
                          <SelectItem key={sch.id} value={sch.id}>
                            {sch.id} - {sch.name}
                          </SelectItem>
                        ))}
                      {loading.school && (
                        <div className="flex justify-center items-center">
                          <LucideLoader2 className="animate-spin h-20" />
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Select the School this student belongs to
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="classId">
                  Class <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={formData.classId || undefined}
                    onValueChange={(value) =>
                      handleSelectChange("classId", value)
                    }
                    disabled={loading.form || loading.class}
                    required
                  >
                    <SelectTrigger
                      disabled={!formData.schoolId}
                      id="classId"
                      className="w-full"
                    >
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {!loading.class &&
                        classes.map((cls, i) => (
                          <SelectItem key={i} value={cls.id}>
                            {cls.name} - Grade {cls.grade}
                            {cls.section ? ` ${cls.section}` : ""} (
                            {cls.academicYear})
                          </SelectItem>
                        ))}
                      {loading.school && (
                        <div className="flex justify-center items-center">
                          <LucideLoader2 className="animate-spin h-20" />
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Select the class this student belongs to
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
                      Inactive students will not appear in attendance lists
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
          onClick={() => navigate("/students")}
          disabled={loading.form}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading.form || loading.class || loading.school}
        >
          {loading.form
            ? "Saving..."
            : isEditMode
              ? "Update Student"
              : "Create Student"}
        </Button>
      </div>
    </form>
  );
}
