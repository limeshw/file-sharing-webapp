import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Cloud, Github, ShieldAlert, Heart, HardDrive, Link2 } from "lucide-react";

export function SiteFooter() {
  const [status, setStatus] = useState("loading"); // loading, online, offline
  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollToUpload = (e) => {
    e.preventDefault();
    if (location.pathname === "/") {
      const element = document.getElementById("upload-panel");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/#upload-panel");
    }
  };

  useEffect(() => {
    let active = true;

    async function checkHealth() {
      try {
        const response = await fetch("/health");
        if (response.ok && active) {
          setStatus("online");
        } else if (active) {
          setStatus("offline");
        }
      } catch {
        if (active) {
          setStatus("offline");
        }
      }
    }

    checkHealth();

    // Check again every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <footer className="mt-16 w-full border-t border-border/60 bg-card/20 py-12 relative z-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Logo Section */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3 group">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/25 transition-all duration-300">
                <Link2 className="size-4.5 text-primary transition-transform group-hover:rotate-45 duration-300" />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">Linkify</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Secure, fast, and temporary file sharing. Upload files up to 10MB and share them instantly with password protection and auto-expiry.
            </p>
            {/* API Health Status indicator */}
            <div className="pt-2 flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-secondary/50 border border-border/80 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground shadow-sm">
                <span className="relative flex h-2 w-2">
                  {status === "online" ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </>
                  ) : status === "offline" ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </>
                  ) : (
                    <>
                      <span className="animate-pulse relative inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
                    </>
                  )}
                </span>
                <span>
                  {status === "online"
                    ? "API Connected"
                    : status === "offline"
                    ? "API Connection Lost"
                    : "Connecting..."}
                </span>
              </div>
            </div>
          </div>

          {/* Links Section 1 */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Product</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a
                  href="#upload-panel"
                  onClick={handleScrollToUpload}
                  className="hover:text-primary hover:underline transition cursor-pointer"
                >
                  Create link
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary hover:underline transition">
                  Dashboard history
                </Link>
              </li>
              <li>
                <a
                  href="#upload-panel"
                  onClick={handleScrollToUpload}
                  className="hover:text-primary hover:underline transition cursor-pointer"
                >
                  File expiry options
                </a>
              </li>
            </ul>
          </div>

          {/* Links Section 2 */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Security</h4>
            <ul className="space-y-2 text-xs text-muted-foreground font-medium">
              <li className="flex items-center gap-1.5">
                <Cloud className="size-3 text-primary" />
                <span>Temporary storage</span>
              </li>
              <li className="flex items-center gap-1.5">
                <HardDrive className="size-3 text-primary" />
                <span>Password gateways</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldAlert className="size-3 text-primary" />
                <span>Encrypted access keys</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom footer bar */}
        <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Linkify. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition"
            >
              <Github className="size-3.5" />
              <span>GitHub</span>
            </a>
            <div className="h-3.5 w-[1px] bg-border/40"></div>
            <p className="flex items-center gap-1">
              Made with <Heart className="size-3 text-rose-500 fill-rose-500 animate-pulse" /> for secure sharing
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
