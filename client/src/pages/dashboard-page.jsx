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

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border border-border bg-card/40 shadow">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                <DatabaseZap className="size-5" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Recent transfers</CardTitle>
                <CardDescription className="text-sm">
                  Reopen your latest share links and check their current status.
                </CardDescription>
              </div>
            </div>
            
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
              <Input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 rounded-lg"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {filteredUploads.length === 0 ? (
        <Card className="text-center py-12 rounded-xl border bg-card/30">
          <p className="text-muted-foreground font-medium text-sm">No files match your search.</p>
        </Card>
      ) : (
        <>
          <DashboardGrid uploads={paginatedUploads} />
          
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(startIndex + ITEMS_PER_PAGE, filteredUploads.length)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{filteredUploads.length}</span> transfers
              </p>
              
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-lg h-9 w-9 border border-border"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Go to previous page"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                
                {getPageNumbers().map((page, idx) => {
                  if (page === "...") {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      className={`h-9 w-9 text-xs rounded-lg font-semibold transition-all duration-200 ${
                        currentPage === page
                          ? "shadow-sm shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground border-transparent"
                          : "hover:bg-secondary/40 text-muted-foreground hover:text-foreground border border-border hover:border-primary/50"
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-lg h-9 w-9 border border-border"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Go to next page"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
