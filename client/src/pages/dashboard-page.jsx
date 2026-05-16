import { useState, useEffect } from "react";
import { DatabaseZap, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardGrid } from "../components/dashboard-grid.jsx";
import { EmptyState } from "../components/empty-state.jsx";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { useLocalStorage } from "../hooks/use-local-storage.js";
import { RECENT_UPLOADS_KEY } from "../lib/constants.js";

export function DashboardPage() {
  const [uploads] = useLocalStorage(RECENT_UPLOADS_KEY, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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

  const filteredUploads = uploads.filter((upload) =>
    (upload.originalName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (upload.uuid || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUploads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUploads = filteredUploads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px]">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex size-12 items-center justify-center rounded-3xl bg-accent text-accent-foreground">
                <DatabaseZap className="size-5" />
              </div>
              <CardTitle className="text-3xl">Recent transfers</CardTitle>
              <CardDescription>
                Reopen your latest share links and check their current status.
              </CardDescription>
            </div>
            
            <div className="relative mt-2 md:mt-0 w-full md:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted/80" />
              <Input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-2xl"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {filteredUploads.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted font-medium">No files match your search.</p>
        </div>
      ) : (
        <>
          <DashboardGrid uploads={paginatedUploads} />
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="secondary"
                className="rounded-2xl flex items-center gap-2"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <span className="text-sm font-medium text-muted">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                className="rounded-2xl flex items-center gap-2"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
