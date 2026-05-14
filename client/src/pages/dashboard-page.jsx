import { DatabaseZap } from "lucide-react";
import { DashboardGrid } from "../components/dashboard-grid.jsx";
import { EmptyState } from "../components/empty-state.jsx";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { useLocalStorage } from "../hooks/use-local-storage.js";
import { RECENT_UPLOADS_KEY } from "../lib/constants.js";

export function DashboardPage() {
  const [uploads] = useLocalStorage(RECENT_UPLOADS_KEY, []);

  if (!uploads.length) {
    return (
      <EmptyState
        title="No recent transfers yet"
        description="This dashboard is backed by your browser’s recent upload history because the backend has no authenticated listing endpoint. Upload a file first, then come back here."
        actionLabel="Go to upload"
        actionHref="/"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px]">
        <CardHeader>
          <div className="mb-3 flex size-12 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 text-white">
            <DatabaseZap className="size-5" />
          </div>
          <CardTitle className="text-3xl">Recent transfers</CardTitle>
          <CardDescription>
            Each card re-checks the real backend metadata endpoint so expired files, password flags, and download counts stay current.
          </CardDescription>
        </CardHeader>
      </Card>

      <DashboardGrid uploads={uploads} />
    </div>
  );
}
