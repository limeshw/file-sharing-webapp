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
          Live metadata from `GET /files/meta/:uuid`, including download count, expiry, and password requirement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InfoPill Icon={FileText} label="File size" value={file.fileSize} />
          <InfoPill Icon={CalendarClock} label="Expires at" value={formatExpiry(file.expiresAt)} />
          <InfoPill Icon={Radar} label="Downloads" value={`${file.downloadCount}`} />
          <InfoPill
            Icon={LockKeyhole}
            label="Access"
            value={file.hasPassword ? (hasAccess ? "Verified" : "Password needed") : "Open"}
          />
        </div>

        <Button className="mt-6 w-full sm:w-auto" onClick={onDownload}>
          <Download className="size-4" />
          {file.hasPassword ? "Continue to protected download" : "Download now"}
        </Button>
      </CardContent>
    </Card>
  );
}

function InfoPill({ Icon, label, value }) {
  return (
    <div className="rounded-[26px] border border-border bg-white/55 p-4 dark:bg-slate-950/25">
      <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
        <Icon className="size-4" />
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
