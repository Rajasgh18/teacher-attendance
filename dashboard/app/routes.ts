import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  route("/login", "pages/login.tsx"),
  layout("components/layout/app-shell.tsx", [
    route("/", "pages/home.tsx"),
    ...prefix("classes", [
      index("pages/classes/index.tsx"),
      route("/new", "pages/classes/new.tsx"),
      route("/:id", "pages/classes/view.tsx"),
      route("/:id/edit", "pages/classes/edit.tsx"),
    ]),
    ...prefix("marks", [
      index("pages/marks/index.tsx"),
      route("/:id", "pages/marks/view.tsx"),
    ]),
    ...prefix("attendance", [
      index("pages/attendance/index.tsx"),
      route("/:id", "pages/attendance/view.tsx"),
    ]),
    ...prefix("students", [
      index("pages/students/index.tsx"),
      route("/new", "pages/students/new.tsx"),
      route("/:id", "pages/students/view.tsx"),
      route("/:id/edit", "pages/students/edit.tsx"),
    ]),
    ...prefix("teachers", [
      index("pages/teachers/index.tsx"),
      route("/new", "pages/teachers/new.tsx"),
      route("/:id", "pages/teachers/view.tsx"),
      route("/:id/edit", "pages/teachers/edit.tsx"),
    ]),
    ...prefix("subjects", [
      index("pages/subjects/index.tsx"),
      route("/new", "pages/subjects/new.tsx"),
      route("/:id", "pages/subjects/view.tsx"),
      route("/:id/edit", "pages/subjects/edit.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
