import { CalendarClock, Download, FileText, LockKeyhole, Radar } from "lucide-react";
import { Badge } from "./ui/badge.jsx";
import { Button } from "./ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.jsx";
import { formatExpiry, getTimeRemainingLabel } from "../lib/utils.js";

export function FileMetadataCard({ file, onDownload, hasAccess }) {
  return (
    <Card className="rounded-[32px]">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{file.hasPassword ? "Password protected" : "Ready to download"}</Badge>
          <Badge>{getTimeRemainingLabel(file.expiresAt)}</Badge>
        </div>
        <CardTitle className="text-2xl">{file.fileName}</CardTitle>
        <CardDescription>
          Review the file details below, then continue to download.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InfoPill Icon={FileText} label="File size" value={file.fileSize} />
          <InfoPill Icon={CalendarClock} label="Expires" value={formatExpiry(file.expiresAt)} />
          <InfoPill Icon={Radar} label="Downloads" value={`${file.downloadCount}`} />
          <InfoPill
            Icon={LockKeyhole}
            label="Access"
            value={file.hasPassword ? (hasAccess ? "Verified" : "Password needed") : "Open"}
          />
        </div>

        <Button className="mt-6 w-full sm:w-auto" onClick={onDownload}>
          <Download className="size-4" />
          {file.hasPassword ? "Continue to download" : "Download now"}
        </Button>
      </CardContent>
    </Card>
  );
}

function InfoPill({ Icon, label, value }) {
  return (
    <div className="rounded-[22px] border border-border bg-slate-50/50 p-4 dark:bg-white/5 dark:border-white/5">
      <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Icon className="size-4" />
      </div>
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
