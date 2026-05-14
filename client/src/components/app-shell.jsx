import { Link, NavLink, Outlet } from "react-router-dom";
import { CloudUpload, LayoutDashboard, Link2 } from "lucide-react";
import { ThemeToggle } from "./theme-toggle.jsx";
import { SiteFooter } from "./site-footer.jsx";
import { cn } from "../lib/utils.js";

const navigation = [
  { to: "/", label: "Upload", icon: CloudUpload },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/files/demo", label: "Share View", icon: Link2, disabled: true },
];

export function AppShell() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="glass-panel sticky top-5 z-30 mb-6 rounded-[28px] px-4 py-3">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 text-white shadow-lg shadow-blue-500/30">
                  <Link2 className="size-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Linkify</p>
                  <p className="text-xs text-muted">No-login file sharing for fast transfers</p>
                </div>
              </Link>
              <ThemeToggle className="lg:hidden" />
            </div>

            <div className="flex items-center gap-3">
              <nav className="flex flex-wrap gap-2">
                {navigation
                  .filter((item) => !item.disabled)
                  .map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
                            isActive
                              ? "bg-accent text-accent-foreground shadow-lg shadow-blue-500/25"
                              : "text-muted hover:bg-white/55 dark:hover:bg-white/6",
                          )
                        }
                      >
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
              </nav>
              <ThemeToggle className="hidden lg:inline-flex" />
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
