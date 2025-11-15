import { Link } from "react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EntityPreviewProps<TItem> {
  title: string;
  description?: string;
  items: TItem[];
  emptyState?: React.ReactNode;
  viewAllHref?: string;
  renderItem: (item: TItem, index: number) => React.ReactNode;
  className?: string;
}

export function EntityPreview<TItem>({
  title,
  description,
  items,
  emptyState,
  viewAllHref,
  renderItem,
  className,
}: EntityPreviewProps<TItem>) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description ? (
              <CardDescription>{description}</CardDescription>
            ) : null}
          </div>
          {viewAllHref ? (
            <Link
              to={viewAllHref}
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0
          ? emptyState ?? (
              <p className="text-sm text-muted-foreground">
                Nothing to display yet.
              </p>
            )
          : items.map((item, index) => (
              <div key={index} className="rounded-md border p-3">
                {renderItem(item, index)}
              </div>
            ))}
      </CardContent>
      {viewAllHref ? (
        <CardFooter className="pt-0">
          <Link
            to={viewAllHref}
            className="text-sm font-medium text-primary hover:underline"
          >
            Manage {title.toLowerCase()}
          </Link>
        </CardFooter>
      ) : null}
    </Card>
  );
}

