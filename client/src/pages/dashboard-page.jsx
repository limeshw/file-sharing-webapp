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
        description="Your recent shared files will appear here after you create a link."
        actionLabel="Go to upload"
        actionHref="/"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px]">
        <CardHeader>
          <div className="mb-3 flex size-12 items-center justify-center rounded-3xl bg-accent text-accent-foreground">
            <DatabaseZap className="size-5" />
          </div>
          <CardTitle className="text-3xl">Recent transfers</CardTitle>
          <CardDescription>
            Reopen your latest share links and check their current status.
          </CardDescription>
        </CardHeader>
      </Card>

      <DashboardGrid uploads={uploads} />
    </div>
  );
}
