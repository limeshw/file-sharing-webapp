import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, ExternalLink, ShieldCheck, TimerReset, QrCode } from "lucide-react";
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
  const [showQr, setShowQr] = useState(false);

  async function handleCopy(value) {
    await copy(value);
    toast.success("Share link copied.");
  }

  return (
    <Card className="rounded-xl border border-border bg-card/40 shadow">
      <CardHeader>
        <CardTitle>{result ? "Your link is ready" : "Share link preview"}</CardTitle>
        <CardDescription className="text-sm">
          {result
            ? "Copy the link below and send it to your receiver."
            : "Once the upload finishes, the share link will appear here."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!result ? (
          <div className="space-y-5">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-52 rounded-lg" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-lg border border-border bg-secondary/10 p-6">
              <h3 className="text-xl font-semibold text-foreground">{result.originalName}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground">
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

            <div className="rounded-lg border border-border bg-secondary/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Share link</p>
              <p className="mt-2 break-all text-sm leading-6 text-foreground font-mono">{buildFrontendSharePath(result.uuid)}</p>
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
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  className={showQr ? "bg-accent text-accent-foreground border-primary/45" : ""}
                  onClick={() => setShowQr(!showQr)}
                >
                  <QrCode className="size-4" />
                  {showQr ? "Hide QR" : "QR Code"}
                </Button>
                <Button asChild size="sm">
                  <Link to={`/files/${result.uuid}`}>
                    Open link
                    <ExternalLink className="size-4" />
                  </Link>
                </Button>
              </div>
              {showQr && (
                <div className="mt-4 flex flex-col items-center justify-center p-4 bg-background/50 border border-border/80 rounded-lg shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-2.5 bg-white rounded-lg shadow border border-slate-200">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=4f46e5&data=${encodeURIComponent(buildFrontendSharePath(result.uuid))}`}
                      alt="File Share QR Code"
                      className="w-[150px] h-[150px]"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-2.5 font-semibold tracking-wide uppercase">Scan to open on mobile</span>
                </div>
              )}
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
    <div className="rounded-lg border border-border bg-background/50 p-4">
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
        <Icon className="size-4" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
