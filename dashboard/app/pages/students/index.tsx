import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { studentService } from "@/services/student-service";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LucidePencil,
  SearchIcon,
} from "lucide-react";
import type { Route } from "./+types/index";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearchParams, useNavigate } from "react-router";

export async function clientLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") ?? 1);
  const limit = Number(url.searchParams.get("limit") ?? 20);
  const searchParam = url.searchParams.get("search");
  const search =
    searchParam && searchParam.trim() ? searchParam.trim() : undefined;
  const studentsList = await studentService.list({
    page,
    limit,
    ...(search && { search }),
  });
  return studentsList;
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function StudentsRoute({
  loaderData: studentsList,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const searchQuery = searchParams.get("search") || "";

  const [searchValue, setSearchValue] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchValue.trim()) {
        params.set("search", searchValue.trim());
      } else {
        params.delete("search");
      }
      params.set("page", "1"); // Reset to first page on search
      navigate(`?${params.toString()}`);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, navigate]);

  // Sync searchValue with URL when it changes externally
  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    navigate(`?${params.toString()}`);
  };

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", String(newLimit));
    params.set("page", "1"); // Reset to first page
    navigate(`?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const { data, pagination } = studentsList;
  const { totalPages } = pagination;

  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
        <p className="text-sm text-muted-foreground">
          Manage students across schools. Build out filtering, pagination and
          CRUD workflows here.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-8 w-60"
            placeholder="Search for students"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
        <Button onClick={() => navigate("/students/new")}>Add Student</Button>
      </div>

      <div className="relative border rounded-lg overflow-hidden flex flex-col flex-1 basis-1">
        <div className="basis-1 flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0">
              <tr className="bg-muted dark:bg-card h-10 text-sm border-b">
                <th className="text-start px-3">Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Class ID</th>
                <th>School ID</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data && data.length > 0 ? (
                data.map((s) => (
                  <tr
                    onClick={() => navigate(`/students/${s.id}/edit`)}
                    key={s.id}
                    className="h-8 dark:hover:bg-card hover:bg-muted cursor-pointer border-b"
                  >
                    <td className="px-3">{s.studentId || "-"}</td>
                    <td>
                      {s.firstName} {s.lastName}
                    </td>
                    <td>{s.email || "-"}</td>
                    <td>{s.classId}</td>
                    <td>{s.schoolId}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-4 text-center text-muted-foreground"
                  >
                    No Students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-2 w-full border-t dark:bg-card">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm">
                Rows: {limit}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {[10, 20, 50, 100].map((l) => (
                <DropdownMenuItem key={l} onClick={() => handleLimitChange(l)}>
                  {l}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-x-2">
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={() => handlePageChange(1)}
              disabled={page <= 1}
            >
              <ChevronsLeft />
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft />
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight />
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={page >= totalPages}
            >
              <ChevronsRight />
            </Button>
          </div>
          <div></div>
        </div>
      </div>
    </main>
  );
}
