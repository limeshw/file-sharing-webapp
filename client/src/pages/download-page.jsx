import { useEffect, useState } from "react";
import { DownloadCloud, ShieldAlert } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { EmptyState } from "../components/empty-state.jsx";
import { PasswordGateCard } from "../components/password-gate-card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Skeleton } from "../components/ui/skeleton.jsx";
import { useDownloadAccess } from "../context/download-access-context.jsx";
import { getErrorMessage, isExpiredStatus } from "../lib/utils.js";
import { downloadFileToDevice, fetchFileMeta } from "../services/file-service.js";

export function DownloadPage() {
  const { uuid } = useParams();
  const { accessMap, saveAccess, clearAccess } = useDownloadAccess();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadFile() {
      try {
        const response = await fetchFileMeta(uuid);

        if (isMounted) {
          setFile(response.data);
          setStatus("ready");
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

  const access = accessMap[uuid];

  async function startDownload() {
    if (!file) {
      return;
    }

    setIsDownloading(true);

    try {
      await downloadFileToDevice({
        uuid,
        accessKey: access?.accessKey,
        filename: file.fileName,
      });
      toast.success("Download started.");
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "The file could not be saved automatically. This may depend on the storage provider response headers.",
        ),
      );
    } finally {
      setIsDownloading(false);
    }
  }

  if (status === "loading") {
    return <Skeleton className="h-96 rounded-[32px]" />;
  }

  if (status === "expired") {
    return (
      <EmptyState
        title="This download is no longer available"
        description={errorMessage}
        actionLabel="Upload new file"
        actionHref="/"
      />
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        title="Unable to prepare this download"
        description={errorMessage}
        actionLabel="Back home"
        actionHref="/"
      />
    );
  }

  if (file.hasPassword && !access) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <Card className="rounded-[32px]">
          <CardHeader>
            <div className="mb-3 flex size-12 items-center justify-center rounded-3xl bg-accent text-accent-foreground">
              <ShieldAlert className="size-5" />
            </div>
            <CardTitle>Password required</CardTitle>
            <CardDescription>Enter the password before starting the download.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-muted">
              Once the password is verified, you can continue with the file download right away.
            </p>
          </CardContent>
        </Card>

        <PasswordGateCard
          uuid={uuid}
          onVerified={(payload) => {
            saveAccess(uuid, payload);
          }}
        />
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-3xl rounded-[36px] p-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-muted">Download</p>
        <h1 className="mt-3 text-3xl font-semibold">{file.fileName}</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          Your file is ready. Start the download when you are ready.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={startDownload} disabled={isDownloading}>
            <DownloadCloud className="size-4" />
            {isDownloading ? "Preparing download..." : "Start download"}
          </Button>
          {file.hasPassword ? (
            <Button type="button" variant="secondary" onClick={() => clearAccess(uuid)}>
              Clear password access
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
