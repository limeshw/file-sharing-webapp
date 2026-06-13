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
          <Card key={item.uuid} className="group relative overflow-hidden border border-border bg-card/40 hover:bg-card/70 shadow transition-all duration-300 hover:-translate-y-1">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <CardTitle className="text-xl truncate group-hover:text-primary transition-colors">
                    {item.originalName}
                  </CardTitle>
                  <CopyableLink link={`${window.location.origin}/files/${item.uuid}`} />
                </div>
                <Button asChild size="icon" variant="outline" className="shrink-0 rounded-lg border border-border/80 group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground text-foreground">
                  <Link to={`/files/${item.uuid}`} aria-label="Go to download page">
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              <PillRow
                Icon={CalendarClock}
                label="Expires"
                value={item.expiresAt ? new Date(item.expiresAt).toLocaleString() : "Unavailable"}
                iconColor="text-violet-600 dark:text-violet-400"
                iconBg="bg-violet-500/10 border-violet-500/20"
              />
              <PillRow
                Icon={LockKeyhole}
                label="Protection"
                value={item.hasPassword ? "Password required" : "Open"}
                iconColor={item.hasPassword ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}
                iconBg={item.hasPassword ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"}
              />
              <PillRow
                Icon={RefreshCw}
                label="Status"
                value={
                  status === "ok"
                    ? `Active Link`
                    : "Expired"
                }
                iconColor={status === "ok" ? "text-primary" : "text-muted-foreground"}
                iconBg={status === "ok" ? "bg-primary/10 border-primary/20" : "bg-secondary border-secondary"}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function PillRow({ Icon, label, value, iconColor = "text-primary", iconBg = "bg-primary/10 border-primary/20" }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border/50 bg-background/30 px-4 py-3 backdrop-blur-sm transition-colors hover:bg-background/50">
      <div className={`flex shrink-0 size-9 items-center justify-center rounded-lg border ${iconBg} ${iconColor}`}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        <p className="text-sm font-medium truncate mt-0.5 text-foreground">{value}</p>
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
      <CardDescription className="truncate min-w-0 text-muted-foreground text-xs" title={link}>
        {link}
      </CardDescription>
      <button
        onClick={handleCopy}
        className="shrink-0 flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        title="Copy link"
        aria-label="Copy link"
      >
        {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}
