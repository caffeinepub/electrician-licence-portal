import { Toaster } from "@/components/ui/sonner";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useParams,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import AdminApplicationDetail from "./pages/AdminApplicationDetail";
import AdminDashboard from "./pages/AdminDashboard";
import ApplyPage from "./pages/ApplyPage";
import HomePage from "./pages/HomePage";
import StatusPage from "./pages/StatusPage";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: Layout,
});

const homeRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: HomePage,
});

const applyRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/apply",
  component: ApplyPage,
});

const statusRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/status",
  component: StatusPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const adminDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/application/$id",
  component: AdminApplicationDetail,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([homeRoute, applyRoute, statusRoute]),
  adminRoute,
  adminDetailRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
