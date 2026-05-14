import { useEffect, useMemo, useState } from "react";
import { Copy, Download, ExternalLink, Shield } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { EmptyState } from "../components/empty-state.jsx";
import { FileMetadataCard } from "../components/file-metadata-card.jsx";
import { PasswordGateCard } from "../components/password-gate-card.jsx";
import { ShareEmailForm } from "../components/share-email-form.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Skeleton } from "../components/ui/skeleton.jsx";
import { useDownloadAccess } from "../context/download-access-context.jsx";
import { useCopyToClipboard } from "../hooks/use-copy-to-clipboard.js";
import { getErrorMessage, isExpiredStatus } from "../lib/utils.js";
import { BACKEND_PUBLIC_BASE_URL } from "../services/api.js";
import { fetchFileMeta } from "../services/file-service.js";

export function FilePage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { accessMap, saveAccess } = useDownloadAccess();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const { copy } = useCopyToClipboard();

  useEffect(() => {
    let isMounted = true;

    async function loadFile() {
      setStatus("loading");

      try {
        const response = await fetchFileMeta(uuid);

        if (isMounted) {
          setFile(response.data);
          setStatus("success");
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(getErrorMessage(error, "Unable to load file metadata."));
        setStatus(isExpiredStatus(error?.response?.status) ? "expired" : "error");
      }
    }

    loadFile();

    return () => {
      isMounted = false;
    };
  }, [uuid]);

  const existingAccess = useMemo(() => accessMap[uuid], [accessMap, uuid]);

  if (status === "loading") {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <Skeleton className="h-72 rounded-[32px]" />
        <Skeleton className="h-96 rounded-[32px]" />
      </div>
    );
  }

  if (status === "expired") {
    return (
      <EmptyState
        title="This share link has expired"
        description={errorMessage || "The backend returned a gone status for this file. Expired files are automatically cleaned up by Linkify."}
        actionLabel="Upload another file"
        actionHref="/"
      />
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        title="We couldn't load this file"
        description={errorMessage || "The requested file metadata could not be fetched."}
        actionLabel="Back to upload"
        actionHref="/"
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
      <div className="space-y-6">
        <FileMetadataCard
          file={file}
          hasAccess={Boolean(existingAccess)}
          onDownload={() => navigate(`/files/download/${uuid}`)}
        />

        <Card className="rounded-[32px]">
          <CardHeader>
            <CardTitle>Share tools</CardTitle>
            <CardDescription>
              These actions use frontend-safe links for the app experience while keeping backend-specific routes available when you need them.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActionRow
              title="Copy current share link"
              description={window.location.href}
              actionLabel="Copy"
              onAction={async () => {
                await copy(window.location.href);
                toast.success("Share link copied.");
              }}
              Icon={Copy}
            />
            <ActionRow
              title="Open backend download route"
              description={`/files/download/${uuid}`}
              actionLabel="Open"
              onAction={() => navigate(`/files/download/${uuid}`)}
              Icon={Download}
            />
            <ActionRow
              title="Backend-rendered page"
              description={`${BACKEND_PUBLIC_BASE_URL}/files/${uuid}`}
              actionLabel="Visit"
              onAction={() =>
                window.open(
                  `${BACKEND_PUBLIC_BASE_URL}/files/${uuid}`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
              Icon={ExternalLink}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {file.hasPassword && !existingAccess ? (
          <PasswordGateCard
            uuid={uuid}
            onVerified={(accessPayload) => {
              saveAccess(uuid, accessPayload);
              navigate(`/files/download/${uuid}`);
            }}
          />
        ) : (
          <Card className="rounded-[32px]">
            <CardHeader>
              <div className="mb-3 flex size-12 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 text-white">
                <Shield className="size-5" />
              </div>
              <CardTitle>Download access ready</CardTitle>
              <CardDescription>
                {file.hasPassword
                  ? "A verified access key is stored in session storage for this browser session."
                  : "This file does not require password verification."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate(`/files/download/${uuid}`)}>
                <Download className="size-4" />
                Continue to download
              </Button>
            </CardContent>
          </Card>
        )}

        <ShareEmailForm uuid={uuid} />
      </div>
    </div>
  );
}

function ActionRow({ title, description, actionLabel, onAction, Icon }) {
  return (
    <div className="flex flex-col gap-3 rounded-[28px] border border-border bg-white/55 p-4 dark:bg-slate-950/25 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 break-all text-xs text-muted">{description}</p>
      </div>
      <Button type="button" variant="secondary" onClick={onAction}>
        <Icon className="size-4" />
        {actionLabel}
      </Button>
    </div>
  );
}
