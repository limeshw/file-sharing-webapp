import { Link } from "react-router-dom";
import { Copy, ExternalLink, ShieldCheck, TimerReset } from "lucide-react";
import { toast } from "sonner";
import { buildFrontendSharePath } from "../services/file-service.js";
import { formatBytes, formatExpiry } from "../lib/utils.js";
import { useCopyToClipboard } from "../hooks/use-copy-to-clipboard.js";
import { Button } from "./ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.jsx";
import { Skeleton } from "./ui/skeleton.jsx";
import { ShareEmailForm } from "./share-email-form.jsx";

export function UploadResultPanel({ result }) {
  const { copy } = useCopyToClipboard();

  async function handleCopy(value) {
    await copy(value);
    toast.success("Share link copied.");
  }

  return (
    <Card className="rounded-[32px]">
      <CardHeader>
        <CardTitle>{result ? "Your link is ready" : "Share link preview"}</CardTitle>
        <CardDescription>
          {result
            ? "Copy the link below and send it to your receiver."
            : "Once the upload finishes, the share link will appear here."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!result ? (
          <div className="space-y-5">
            <Skeleton className="h-32 rounded-[24px]" />
            <Skeleton className="h-16 rounded-[20px]" />
            <Skeleton className="h-52 rounded-[24px]" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-[28px] border border-border bg-card p-6">
              <h3 className="text-2xl font-semibold">{result.originalName}</h3>
              <p className="mt-2 text-sm text-muted">
                {formatBytes(result.size)} • {result.mimeType}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ResultStat
                  Icon={TimerReset}
                  label="Expires"
                  value={formatExpiry(result.expiresAt)}
                />
                <ResultStat
                  Icon={ShieldCheck}
                  label="Access"
                  value={result.hasPassword ? "Password protected" : "Open with link"}
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-border bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">Share link</p>
              <p className="mt-2 break-all text-sm leading-6">{buildFrontendSharePath(result.uuid)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => handleCopy(buildFrontendSharePath(result.uuid))}
                >
                  <Copy className="size-4" />
                  Copy link
                </Button>
                <Button asChild size="sm">
                  <Link to={`/files/${result.uuid}`}>
                    Open link
                    <ExternalLink className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <ShareEmailForm uuid={result.uuid} compact />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ResultStat({ Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-slate-50 p-4 dark:bg-slate-950">
      <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Icon className="size-4" />
      </div>
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
