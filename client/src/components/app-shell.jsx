import { Link, NavLink, Outlet } from "react-router-dom";
import { CloudUpload, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "./theme-toggle.jsx";
import { SiteFooter } from "./site-footer.jsx";
import { cn } from "../lib/utils.js";

const navigation = [
  { to: "/", label: "Upload", icon: CloudUpload },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function AppShell() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-5 z-30 mb-6 rounded-[24px] border border-border bg-card px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/linkify-logo.png"
                  alt="Linkify"
                  className="h-8 w-auto object-contain sm:h-9"
                />
                <div className="hidden sm:block">
                  <p className="text-xs text-muted">File sharing made simple</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <nav className="flex flex-wrap gap-2">
                {navigation.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted hover:bg-slate-100 dark:hover:bg-slate-900",
                        )
                      }
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
              <ThemeToggle className="shrink-0" showLabel />
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
