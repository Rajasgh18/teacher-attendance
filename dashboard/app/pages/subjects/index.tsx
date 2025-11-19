import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subjectService } from "@/services/subject-service";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LucideEye,
  LucideLoader2,
  LucidePencil,
  LucideTrash,
  SearchIcon,
} from "lucide-react";
import type { Route } from "./+types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearchParams, useNavigate } from "react-router";
import type { SubjectEntity } from "@/types/subject";
import { Loader } from "@/components/loader";
import { Checkbox } from "@/components/ui/checkbox";

export default function SubjectsRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const searchQuery = searchParams.get("search") || "";

  const [searchValue, setSearchValue] = useState(searchQuery);
  const [subjectsList, setSubjectsList] = useState<SubjectEntity[]>([]);
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
  }, [searchValue, navigate, searchParams]);

  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const search =
          searchQuery && searchQuery.trim() ? searchQuery.trim() : undefined;
        const list = await subjectService.list({
          page,
          limit,
          ...(search && { search }),
        });

        setTotalPages(list.pagination.totalPages);
        setTotalCount(list.pagination.total);
        setSubjectsList(list.data);
        setSelectedIds([]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load subjects.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [page, limit, searchQuery, refreshKey]);

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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === subjectsList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subjectsList.map((subject) => subject.id));
    }
  };

  const deleteSubjects = async (ids: string[]) => {
    if (ids.length === 0) return;
    const confirmation = window.confirm(
      `Delete ${ids.length} subject${ids.length > 1 ? "s" : ""}?`,
    );
    if (!confirmation) return;

    try {
      setDeleting(true);
      await Promise.all(ids.map((id) => subjectService.deleteSubject(id)));
      setSelectedIds([]);
      setRefreshKey((prev) => prev + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete subjects.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSelected = () => {
    deleteSubjects(selectedIds);
  };

  const handleDeleteSingle = (id: string) => {
    deleteSubjects([id]);
  };

  const isAllSelected =
    subjectsList.length > 0 && selectedIds.length === subjectsList.length;

  return (
    <main className="flex flex-col gap-y-4 h-full p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Subjects</h1>
        <p className="text-sm text-muted-foreground">
          Manage subjects across schools. Build out filtering, pagination and
          CRUD workflows here.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-8 w-60"
            placeholder="Search for subjects"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            disabled={selectedIds.length === 0 || deleting}
            onClick={handleDeleteSelected}
          >
            {deleting ? "Deleting..." : "Delete Selected"}
          </Button>
          <Button onClick={() => navigate("/subjects/new")}>Add Subject</Button>
        </div>
      </div>

      <div className="relative border rounded-lg overflow-hidden flex flex-col flex-1 basis-1">
        <div className="basis-1 flex-1 flex flex-col overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0">
              <tr className="bg-muted dark:bg-card h-10 text-sm border-b">
                <th className="w-10 px-3 text-center">
                  <Checkbox
                    className="size-4"
                    checked={isAllSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all subjects"
                  />
                </th>
                <th className="text-start px-3">ID</th>
                <th>Name</th>
                <th>Code</th>
                <th>Description</th>
                <th className="w-32">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {!loading &&
                subjectsList.length > 0 &&
                subjectsList.map((s: SubjectEntity) => (
                  <tr
                    key={s.id}
                    className="h-8 dark:hover:bg-card hover:bg-muted cursor-pointer border-b"
                  >
                    <td
                      className="px-3 text-center"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Checkbox
                        className="size-4"
                        checked={selectedIds.includes(s.id)}
                        onCheckedChange={() => toggleSelect(s.id)}
                        aria-label={`Select subject ${s.name}`}
                      />
                    </td>
                    <td className="px-3">{s.id}</td>
                    <td>{s.name}</td>
                    <td>{s.code}</td>
                    <td>{s.description || "-"}</td>
                    <td className="space-x-1">
                      <Button
                        onClick={() => navigate(`/subjects/${s.id}`)}
                        variant="ghost"
                        size="icon-sm"
                        className="size-6"
                      >
                        <LucideEye className="size-3.5" />
                      </Button>
                      <Button
                        onClick={() => navigate(`/subjects/${s.id}/edit`)}
                        variant="ghost"
                        size="icon-sm"
                        className="size-6"
                      >
                        <LucidePencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-6"
                        onClick={() => handleDeleteSingle(s.id)}
                        disabled={deleting}
                      >
                        <LucideTrash className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {subjectsList.length === 0 && (
            <div className="basis-1 flex-1 w-full flex justify-center items-center">
              {loading && <Loader />}
              {error && <p className="text-destructive">{error}</p>}
              {!loading && !error && <p>No subjects found</p>}
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
