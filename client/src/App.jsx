import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell } from "./components/app-shell.jsx";
import { DownloadAccessProvider } from "./context/download-access-context.jsx";
import { ThemeProvider } from "./context/theme-context.jsx";
import { HomePage } from "./pages/home-page.jsx";

// Helper to load components lazily while handling chunk failures due to redeployments
function safeLazy(importFn) {
  return lazy(() =>
    importFn()
      .then((module) => {
        sessionStorage.removeItem("chunk-reload-attempted");
        return module;
      })
      .catch((err) => {
        console.error("Failed to load chunk. Reloading page...", err);
        const hasReloaded = sessionStorage.getItem("chunk-reload-attempted");
        if (!hasReloaded) {
          sessionStorage.setItem("chunk-reload-attempted", "true");
          window.location.reload();
          return new Promise(() => {}); // Wait for the reload to trigger
        }
        throw err;
      })
  );
}

const DashboardPage = safeLazy(() => import("./pages/dashboard-page.jsx").then(m => ({ default: m.DashboardPage })));
const FilePage = safeLazy(() => import("./pages/file-page.jsx").then(m => ({ default: m.FilePage })));
const NotFoundPage = safeLazy(() => import("./pages/not-found-page.jsx").then(m => ({ default: m.NotFoundPage })));

const LoadingFallback = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "dashboard", element: <Suspense fallback={<LoadingFallback />}><DashboardPage /></Suspense> },
      { path: "files/:uuid", element: <Suspense fallback={<LoadingFallback />}><FilePage /></Suspense> },
      { path: "*", element: <Suspense fallback={<LoadingFallback />}><NotFoundPage /></Suspense> },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <DownloadAccessProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </DownloadAccessProvider>
    </ThemeProvider>
  );
}
