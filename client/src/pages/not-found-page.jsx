import { Compass } from "lucide-react";
import { EmptyState } from "../components/empty-state.jsx";

export function NotFoundPage() {
  return (
    <div className="space-y-6">
      <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 text-white">
        <Compass className="size-6" />
      </div>
      <EmptyState
        title="404: route not found"
        description="This frontend keeps a deliberate route surface: `/`, `/dashboard`, `/files/:uuid`, and `/files/download/:uuid`."
        actionLabel="Back to upload"
        actionHref="/"
      />
    </div>
  );
}
