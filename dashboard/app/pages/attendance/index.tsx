import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { attendanceService } from "@/services/attendance-service";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LucideEye,
  LucidePencil,
  LucideTrash,
  SearchIcon,
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router";
import type {
  TeacherAttendanceEntity,
  StudentAttendanceEntity,
} from "@/types/attendance";
import { Loader } from "@/components/loader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { StatusCell } from "@/components/status";
import { Checkbox } from "@/components/ui/checkbox";

export default function AttendanceRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const searchQuery = searchParams.get("search") || "";
  const tab = searchParams.get("tab") || "teacher";

  const [searchValue, setSearchValue] = useState(searchQuery);
  const [attendanceList, setAttendanceList] = useState<
    (TeacherAttendanceEntity | StudentAttendanceEntity)[]
  >([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
  }, [searchValue]);

  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        setAttendanceList([]);
        const search =
          searchQuery && searchQuery.trim() ? searchQuery.trim() : undefined;

        const list =
          tab === "teacher"
            ? await attendanceService.listTeacher({
                page,
                limit,
                ...(search && { search }),
              })
            : await attendanceService.listStudent({
                page,
                limit,
                ...(search && { search }),
              });

        setTotalPages(list.pagination.totalPages);
        setTotalCount(list.pagination.total);
        setAttendanceList(list.data);
        setSelectedIds([]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load attendance.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [page, limit, searchQuery, tab, refreshKey]);

  useEffect(() => {
    setSelectedIds([]);
  }, [tab]);

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

  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", newTab);
    params.set("page", "1");
    navigate(`?${params.toString()}`);
  };

  const isStudentTab = tab === "student";

  const toggleSelect = (id: string) => {
    if (!isStudentTab) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (!isStudentTab) return;
    console.log("hello");
    if (selectedIds.length === attendanceList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(attendanceList.map((item) => item.id));
    }
  };

  const deleteAttendance = async (ids: string[]) => {
    if (!isStudentTab || ids.length === 0) return;
    const confirmation = window.confirm(
      `Delete ${ids.length} attendance record${ids.length > 1 ? "s" : ""}?`,
    );
    if (!confirmation) return;

    try {
      setDeleting(true);
      await Promise.all(
        ids.map((id) => attendanceService.deleteStudentAttendance(id)),
      );
      setSelectedIds([]);
      setRefreshKey((prev) => prev + 1);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to delete attendance records.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSelected = () => {
    deleteAttendance(selectedIds);
  };

  const handleDeleteSingle = (id: string) => {
    deleteAttendance([id]);
  };

  const isAllSelected =
    isStudentTab &&
    attendanceList.length > 0 &&
    selectedIds.length === attendanceList.length;

  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Manage attendance records.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="teacher">Teacher</TabsTrigger>
            <TabsTrigger value="student">Student</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-8 w-60"
            placeholder="Search for attendance"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex items-center gap-2">
          {isStudentTab && (
            <Button
              variant="destructive"
              disabled={selectedIds.length === 0 || deleting}
              onClick={handleDeleteSelected}
            >
              {deleting ? "Deleting..." : "Delete Selected"}
            </Button>
          )}
          <Button onClick={() => navigate(`/attendance/new?tab=${tab}`)}>
            Add Attendance
          </Button>
        </div>
      </div>

      <div className="relative border rounded-lg overflow-hidden flex flex-col flex-1 basis-1">
        <div className="basis-1 flex-1 flex flex-col overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0">
              <tr className="bg-muted dark:bg-card h-10 text-sm border-b">
                {isStudentTab && (
                  <th className="w-10 px-3 text-center">
                    <Checkbox
                      className="size-4"
                      checked={isAllSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all attendance rows"
                    />
                  </th>
                )}
                {tab === "teacher" ? (
                  <>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Check-In</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Status</th>
                  </>
                ) : (
                  <>
                    <th>Student Id</th>
                    <th>Student Name</th>
                    <th>Marked By</th>
                    <th>Date</th>
                    <th>Status</th>
                  </>
                )}
                <th className="w-32">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {!loading &&
                attendanceList.length > 0 &&
                attendanceList.map((att) => (
                  <tr key={att.id} className="h-8 border-b">
                    {isStudentTab && "studentId" in att && (
                      <td className="px-3 text-center">
                        <Checkbox
                          className="size-4"
                          checked={selectedIds.includes(att.id)}
                          onCheckedChange={() => toggleSelect(att.id)}
                        />
                      </td>
                    )}
                    {tab === "teacher" && "teacherId" in att && (
                      <>
                        <td>{att.teacher.employeeId}</td>
                        <td>{att.teacher.firstName}</td>
                        <td>{att.checkIn ? "Yes" : "No"}</td>
                        <td>{att.latitude}</td>
                        <td>{att.longitude}</td>
                        <td>
                          <StatusCell status={att.status} />
                        </td>
                      </>
                    )}
                    {tab === "student" && "studentId" in att && (
                      <>
                        <td>{att.student.studentId || "-"}</td>
                        <td>{att.student.firstName}</td>
                        <td>{att.markedByUser.firstName}</td>
                        <td>{new Date(att.date).toLocaleDateString()}</td>
                        <td>
                          <StatusCell status={att.status} />
                        </td>
                      </>
                    )}
                    <td className="space-x-1">
                      <Button
                        onClick={() =>
                          navigate(`/attendance/${att.id}?tab=${tab}`)
                        }
                        variant="ghost"
                        size="icon-sm"
                        className="size-6"
                      >
                        <LucideEye className="size-3.5" />
                      </Button>
                      {isStudentTab && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-6"
                          onClick={() => handleDeleteSingle(att.id)}
                          disabled={deleting}
                        >
                          <LucideTrash className="size-3.5" />
                        </Button>
                      )}
                      {tab === "teacher" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-6"
                          disabled
                          title="Deletion available only for student records"
                        >
                          <LucideTrash className="size-3.5 opacity-50" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {attendanceList.length === 0 && (
            <div className="basis-1 flex-1 w-full flex justify-center items-center">
              {loading && <Loader />}
              {error && <p className="text-destructive">{error}</p>}
              {!loading && !error && <p>No attendance records found</p>}
            </div>
          )}
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
          <div className="text-sm pr-2">Total: {totalCount}</div>
        </div>
      </div>
    </main>
  );
}
