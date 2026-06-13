import { Compass } from "lucide-react";
import { EmptyState } from "../components/empty-state.jsx";

export function NotFoundPage() {
  return (
    <div className="space-y-6">
      <div className="mx-auto flex size-16 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm animate-pulse">
        <Compass className="size-6" />
      </div>
      <EmptyState
        title="404: route not found"
        description="This frontend keeps a deliberate route surface: `/`, `/dashboard`, and `/files/:uuid`."
        actionLabel="Back to upload"
        actionHref="/"
      />
    </div>
  );
}
