import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { DashboardSummary } from "../hooks/useDashboardData";

interface SummaryCardsProps {
  summary: DashboardSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const formatter = new Intl.NumberFormat();

  const items = [
    {
      label: "Classes",
      value: formatter.format(summary.totalClasses),
      description: "Active classes currently managed",
    },
    {
      label: "Students",
      value: formatter.format(summary.totalStudents),
      description: "Students tracked in the system",
    },
    {
      label: "Teachers",
      value: formatter.format(summary.totalTeachers),
      description: "Teachers with active accounts",
    },
    {
      label: "Subjects",
      value: formatter.format(summary.totalSubjects),
      description: "Subjects mapped across classes",
    },
  ];

  const extendedItems = summary.totalAdmins
    ? [
        ...items,
        {
          label: "Admins",
          value: formatter.format(summary.totalAdmins),
          description: "Administrative accounts",
        },
        ...(summary.totalUsers
          ? [
              {
                label: "Total Users",
                value: formatter.format(summary.totalUsers),
                description: "All registered platform users",
              },
            ]
          : []),
      ]
    : items;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {extendedItems.map((item) => (
        <Card key={item.label} className="py-3 rounded-lg">
          <CardContent className="px-4 flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">{item.label}</h4>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
            <h2 className="text-2xl font-bold">{item.value}</h2>
          </CardContent>
        </Card>
      ))}
      {summary.contextLabel && summary.contextValue ? (
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{summary.contextLabel}</CardDescription>
            <CardTitle className="text-xl font-semibold">
              {summary.contextValue}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Context applied to this dashboard view
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
