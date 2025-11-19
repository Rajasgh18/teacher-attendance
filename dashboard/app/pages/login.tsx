import { useCallback, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading, login } = useAuth();
  const redirectTo = searchParams.get("redirect") || "/";

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(null);
      setIsSubmitting(true);

      try {
        await login({ employeeId, password });
        navigate(redirectTo, { replace: true });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to login. Try again.";
        setFormError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [employeeId, password, login, navigate, redirectTo],
  );

  if (!isLoading && user) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Teacher Attendance Admin</CardTitle>
          <CardDescription>
            Sign in with your employee ID and password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="employeeId">Employee ID</FieldLabel>
                <Input
                  id="employeeId"
                  name="employeeId"
                  type="text"
                  placeholder="EMP-001"
                  autoComplete="username"
                  value={employeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </Field>
            </FieldGroup>

            {formError ? <FieldError>{formError}</FieldError> : null}

            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
