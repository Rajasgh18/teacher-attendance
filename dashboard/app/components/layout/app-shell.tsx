import { NavLink, Outlet, useNavigation } from "react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { Navigate } from "react-router";
import {
  LucideLoader2,
  LucideLogOut,
  LucideMoon,
  LucideSun,
  LucideUser2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { useTheme } from "@/providers/theme-provider";

const NAVIGATION_ITEMS = [
  { label: "Dashboard", to: "/" },
  { label: "Classes", to: "/classes", roles: ["admin", "principal"] as const },
  {
    label: "Students",
    to: "/students",
    roles: ["admin", "principal"] as const,
  },
  {
    label: "Teachers",
    to: "/teachers",
    roles: ["admin", "principal"] as const,
  },
  {
    label: "Subjects",
    to: "/subjects",
    roles: ["admin", "principal"] as const,
  },
  {
    label: "Attendance",
    to: "/attendance",
    roles: ["admin", "principal"] as const,
  },
  {
    label: "Marks",
    to: "/marks",
    roles: ["admin", "principal"] as const,
  },
];

export default function AppShell() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigation = useNavigation();
  // const isNavigating = Boolean(navigation.location);

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <section className="flex flex-col items-center space-y-2">
          <LucideLoader2 className="animate-spin size-6" />
          <p className="text-sm text-muted-foreground">
            Loading your session...
          </p>
        </section>
      </div>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  const filteredNav = NAVIGATION_ITEMS.filter((item) => {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role as (typeof item.roles)[number]);
  });

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden h-screen sticky left-0 top-0 w-60 flex-col border-r bg-background p-3 md:flex">
        <div className="mb-8">
          <p className="text-xl font-semibold">Attendance Admin</p>
          <p className="text-sm text-muted-foreground">
            {user?.role === "admin"
              ? "Super Admin"
              : user?.role === "principal"
                ? "Principal"
                : "User"}
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
              end={item.to === "/"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              void logout();
            }}
          >
            <LucideLogOut />
            Sign out
          </Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="border-b bg-background sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-2 md:px-8">
            <div>
              <p className="text-lg font-semibold text-foreground">
                Welcome back{user ? `, ${user.firstName}` : ""}!
              </p>
              {user?.school?.name ? (
                <p className="text-sm text-muted-foreground">
                  {user.role === "principal"
                    ? `Managing ${user.school.name}`
                    : `Assigned to ${user.school.name}`}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <LucideUser2 className="size-4" />
                    <p className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={logout}>
                    <LucideLogOut />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                size="icon-sm"
                variant="ghost"
              >
                {theme === "dark" ? <LucideMoon /> : <LucideSun />}
              </Button>
            </div>
          </div>
        </header>
        <>
          <Outlet />
        </>
      </div>
    </div>
  );
}
