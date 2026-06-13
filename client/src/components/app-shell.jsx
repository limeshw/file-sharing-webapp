import { Link, NavLink, Outlet } from "react-router-dom";
import { CloudUpload, LayoutDashboard, Link2 } from "lucide-react";
import { ThemeToggle } from "./theme-toggle.jsx";
import { SiteFooter } from "./site-footer.jsx";
import { cn } from "../lib/utils.js";

const navigation = [
  { to: "/", label: "Upload", icon: CloudUpload },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col justify-between">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Premium Floating Header */}
        <header className="sticky top-6 z-40 mb-8 rounded-2xl border border-border/60 bg-background/50 backdrop-blur-xl px-5 py-4 shadow-xl shadow-black/10 transition-all duration-300">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative flex items-center justify-center p-2.5 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-all duration-300">
                  <div className="absolute inset-0 bg-primary/20 rounded-xl blur group-hover:blur-md transition-all duration-300 opacity-50"></div>
                  <Link2 className="size-5 text-primary relative z-10 transition-transform group-hover:rotate-45 duration-300" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent group-hover:text-primary transition-all duration-300">Linkify</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 font-medium hidden sm:block">File sharing made simple</span>
                </div>
              </Link>
              {/* Mobile theme toggle */}
              <div className="sm:hidden">
                <ThemeToggle className="shrink-0 border-border/60 hover:bg-secondary hover:text-foreground" showLabel={false} />
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
              <nav className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start">
                {navigation.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          "relative inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 border w-full sm:w-auto",
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                            : "text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground hover:border-border/60",
                        )
                      }
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
              <div className="h-6 w-[1px] bg-border/60 hidden sm:block"></div>
              {/* Desktop theme toggle */}
              <div className="hidden sm:block">
                <ThemeToggle className="shrink-0 border-border/60 hover:bg-secondary hover:text-foreground" showLabel={false} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 py-2 relative z-10">
          <Outlet />
        </main>
      </div>
      
      <SiteFooter />
    </div>
  );
}
