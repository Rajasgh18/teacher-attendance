import { cn } from "@/lib/utils";

export const StatusCell = ({ status }: { status: string }) => {
  return (
    <div
      className={cn(
        "py-1 px-2 w-fit text-[10px] rounded-md border uppercase",
        status === "present" || status === "active"
          ? "bg-green-500/20 border-green-500 text-green-500"
          : "bg-destructive/20 border-destructive text-destructive",
      )}
    >
      {status}
    </div>
  );
};
