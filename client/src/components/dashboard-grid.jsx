import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarClock, LockKeyhole, RefreshCw } from "lucide-react";
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
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: Math.min(uploads.length || 2, 4) }).map((_, index) => (
          <Skeleton key={index} className="h-64 rounded-[30px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <Card key={item.uuid} className="rounded-[30px]">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg">{item.meta?.fileName || item.originalName}</CardTitle>
                <CardDescription>{item.uuid}</CardDescription>
              </div>
              <Button asChild size="icon" variant="secondary">
                <a href={`/files/${item.uuid}`}>
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <PillRow
              Icon={CalendarClock}
              label="Expires"
              value={item.meta?.expiresAt ? new Date(item.meta.expiresAt).toLocaleString() : "Unavailable"}
            />
            <PillRow
              Icon={LockKeyhole}
              label="Protection"
              value={item.meta?.hasPassword ? "Password required" : "Open"}
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
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PillRow({ Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-[24px] border border-border bg-white/55 px-4 py-3 dark:bg-slate-950/25">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
