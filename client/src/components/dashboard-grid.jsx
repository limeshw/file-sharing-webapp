import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight , CalendarClock, LockKeyhole, RefreshCw } from "lucide-react";
import { fetchFileMeta } from "../services/file-service.js";
import { Button } from "./ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.jsx";
import { Skeleton } from "./ui/skeleton.jsx";

export function DashboardGrid({ uploads }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      setIsLoading(true);

      const responses = await Promise.all(
        uploads.map(async (upload) => {
          try {
            const response = await fetchFileMeta(upload.uuid);
            return { ...upload, status: "ok", meta: response.data };
          } catch (error) {
            return {
              ...upload,
              status: error?.response?.status === 410 ? "expired" : "error",
              meta: null,
            };
          }
        }),
      );

      if (isMounted) {
        setItems(responses);
        setIsLoading(false);
      }
    }

    hydrate();

    return () => {
      isMounted = false;
    };
  }, [uploads]);

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: Math.min(uploads.length || 2, 4) }).map((_, index) => (
          <Skeleton key={index} className="h-72 rounded-[32px] bg-slate-100/50 dark:bg-slate-800/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {items.map((item) => (
        <Card key={item.uuid} className="glass-panel group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <CardHeader className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="text-xl truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.meta?.fileName || item.originalName}
                </CardTitle>
                <CardDescription className="truncate mt-1.5">{item.uuid}</CardDescription>
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
              value={item.meta?.expiresAt ? new Date(item.meta.expiresAt).toLocaleString() : "Unavailable"}
              iconColor="text-blue-500"
              iconBg="bg-blue-50 dark:bg-blue-500/10"
            />
            <PillRow
              Icon={LockKeyhole}
              label="Protection"
              value={item.meta?.hasPassword ? "Password required" : "Open"}
              iconColor={item.meta?.hasPassword ? "text-amber-500" : "text-emerald-500"}
              iconBg={item.meta?.hasPassword ? "bg-amber-50 dark:bg-amber-500/10" : "bg-emerald-50 dark:bg-emerald-500/10"}
            />
            <PillRow
              Icon={RefreshCw}
              label="Status"
              value={
                item.status === "ok"
                  ? `Active - ${item.meta.downloadCount} downloads`
                  : item.status === "expired"
                    ? "Expired"
                    : "Unavailable"
              }
              iconColor={item.status === "ok" ? "text-indigo-500" : "text-slate-400"}
              iconBg={item.status === "ok" ? "bg-indigo-50 dark:bg-indigo-500/10" : "bg-slate-100 dark:bg-slate-800"}
            />
          </CardContent>
        </Card>
      ))}
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
