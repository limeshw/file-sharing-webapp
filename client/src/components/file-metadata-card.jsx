import { CalendarClock, Download, FileText, LockKeyhole, Radar } from "lucide-react";
import { Badge } from "./ui/badge.jsx";
import { Button } from "./ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.jsx";
import { formatExpiry, getTimeRemainingLabel } from "../lib/utils.js";
import { Progress } from "./ui/progress.jsx";

export function FileMetadataCard({ file, onDownload, hasAccess, isDownloading, downloadProgress }) {
  return (
    <Card className="rounded-xl border border-border bg-card/40 shadow @container">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={file.hasPassword ? "destructive" : "default"}>
            {file.hasPassword ? "Password protected" : "Ready to download"}
          </Badge>
          <Badge variant="secondary">{getTimeRemainingLabel(file.expiresAt)}</Badge>
        </div>
        <CardTitle className="text-2xl mt-2">{file.fileName}</CardTitle>
        <CardDescription className="text-sm">
          Review the file details below, then continue to download.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 @sm:grid-cols-2 @xl:grid-cols-4">
          <InfoPill Icon={FileText} label="File size" value={file.fileSize} />
          <InfoPill Icon={CalendarClock} label="Expires" value={formatExpiry(file.expiresAt)} />
          <InfoPill Icon={Radar} label="Downloads" value={`${file.downloadCount}`} />
          <InfoPill
            Icon={LockKeyhole}
            label="Access"
            value={file.hasPassword ? (hasAccess ? "Verified" : "Password needed") : "Open"}
          />
        </div>

        <Button 
          className="mt-6 w-full sm:w-auto" 
          onClick={onDownload} 
          disabled={isDownloading || (file.hasPassword && !hasAccess)}
        >
          <Download className="size-4" />
          {isDownloading 
            ? `Downloading... ${downloadProgress}%` 
            : (file.hasPassword && !hasAccess) 
                ? "Unlock file to download" 
                : "Download file"
          }
        </Button>

        {isDownloading ? (
          <div className="mt-6 space-y-2 max-w-sm">
            <Progress value={downloadProgress} className="h-2.5 w-full" />
            <p className="text-xs text-muted-foreground text-right">{downloadProgress}% complete</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function InfoPill({ Icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-4 shadow-sm">
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
        <Icon className="size-4" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
