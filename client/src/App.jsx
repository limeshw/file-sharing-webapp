import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell } from "./components/app-shell.jsx";
import { DownloadAccessProvider } from "./context/download-access-context.jsx";
import { ThemeProvider } from "./context/theme-context.jsx";
import { DashboardPage } from "./pages/dashboard-page.jsx";
import { DownloadPage } from "./pages/download-page.jsx";
import { FilePage } from "./pages/file-page.jsx";
import { HomePage } from "./pages/home-page.jsx";
import { NotFoundPage } from "./pages/not-found-page.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "files/:uuid", element: <FilePage /> },
      { path: "files/download/:uuid", element: <DownloadPage /> },
      { path: "*", element: <NotFoundPage /> },
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
