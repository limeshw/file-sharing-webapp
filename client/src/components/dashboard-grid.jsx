import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarClock, LockKeyhole, RefreshCw, Copy, Check } from "lucide-react";
import { Button } from "./ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.jsx";
import { Skeleton } from "./ui/skeleton.jsx";

export function DashboardGrid({ uploads }) {
  if (!uploads || uploads.length === 0) {
    return null;
  }

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {uploads.map((item) => {
        const expired = isExpired(item.expiresAt);
        const status = expired ? "expired" : "ok";

        return (
          <Card key={item.uuid} className="glass-panel group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <CardTitle className="text-xl truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.originalName}
                  </CardTitle>
                  <CopyableLink link={`${window.location.origin}/files/${item.uuid}`} />
                </div>
                <Button asChild size="icon" variant="secondary" className="shrink-0 rounded-2xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 group-hover:text-indigo-600 transition-colors text-indigo-500">
                  <Link to={`/files/${item.uuid}`} aria-label="Go to download page">
                    <ArrowRight  className="size-5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              <PillRow
                Icon={CalendarClock}
                label="Expires"
                value={item.expiresAt ? new Date(item.expiresAt).toLocaleString() : "Unavailable"}
                iconColor="text-blue-500"
                iconBg="bg-blue-50 dark:bg-blue-500/10"
              />
              <PillRow
                Icon={LockKeyhole}
                label="Protection"
                value={item.hasPassword ? "Password required" : "Open"}
                iconColor={item.hasPassword ? "text-amber-500" : "text-emerald-500"}
                iconBg={item.hasPassword ? "bg-amber-50 dark:bg-amber-500/10" : "bg-emerald-50 dark:bg-emerald-500/10"}
              />
              <PillRow
                Icon={RefreshCw}
                label="Status"
                value={
                  status === "ok"
                    ? `Active Link`
                    : "Expired"
                }
                iconColor={status === "ok" ? "text-indigo-500" : "text-slate-400"}
                iconBg={status === "ok" ? "bg-indigo-50 dark:bg-indigo-500/10" : "bg-slate-100 dark:bg-slate-800"}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function PillRow({ Icon, label, value, iconColor = "text-indigo-500", iconBg = "bg-indigo-50 dark:bg-indigo-500/10" }) {
  return (
    <div className="flex items-center gap-4 rounded-[20px] border border-border/50 bg-white/40 px-4 py-3 dark:bg-slate-900/40 backdrop-blur-sm transition-colors hover:bg-white/60 dark:hover:bg-slate-900/60">
      <div className={`flex shrink-0 size-10 items-center justify-center rounded-2xl ${iconBg} ${iconColor}`}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted font-semibold">{label}</p>
        <p className="text-sm font-medium truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function CopyableLink({ link }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <CardDescription className="truncate min-w-0" title={link}>
        {link}
      </CardDescription>
      <button
        onClick={handleCopy}
        className="shrink-0 flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 transition-colors"
        title="Copy link"
        aria-label="Copy link"
      >
        {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}
