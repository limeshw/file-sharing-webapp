import { useEffect, useMemo, useState } from "react";
import { Download, Shield } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "../components/empty-state.jsx";
import { FileMetadataCard } from "../components/file-metadata-card.jsx";
import { PasswordGateCard } from "../components/password-gate-card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Skeleton } from "../components/ui/skeleton.jsx";
import { useDownloadAccess } from "../context/download-access-context.jsx";
import { getErrorMessage, isExpiredStatus } from "../lib/utils.js";
import { fetchFileMeta } from "../services/file-service.js";

export function FilePage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { accessMap, saveAccess } = useDownloadAccess();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

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
        <Skeleton className="h-80 rounded-[32px]" />
      </div>
    );
  }

  if (status === "expired") {
    return (
      <EmptyState
        title="This share link has expired"
        description={errorMessage || "This file is no longer available."}
        actionLabel="Upload another file"
        actionHref="/"
      />
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        title="We couldn't load this file"
        description={errorMessage || "The requested file could not be loaded."}
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
              <div className="mb-3 flex size-12 items-center justify-center rounded-3xl bg-accent text-accent-foreground">
                <Shield className="size-5" />
              </div>
              <CardTitle>Ready to download</CardTitle>
              <CardDescription>
                {file.hasPassword
                  ? "Password has been verified for this browser session."
                  : "This file can be downloaded directly."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate(`/files/download/${uuid}`)}>
                <Download className="size-4" />
                Continue
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
