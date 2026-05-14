import { useEffect, useState } from "react";
import { DownloadCloud, ShieldAlert } from "lucide-react";
import { useParams } from "react-router-dom";
import { EmptyState } from "../components/empty-state.jsx";
import { PasswordGateCard } from "../components/password-gate-card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Skeleton } from "../components/ui/skeleton.jsx";
import { useDownloadAccess } from "../context/download-access-context.jsx";
import { getErrorMessage, isExpiredStatus } from "../lib/utils.js";
import { buildDownloadPath, fetchFileMeta } from "../services/file-service.js";

export function DownloadPage() {
  const { uuid } = useParams();
  const { accessMap, saveAccess, clearAccess } = useDownloadAccess();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

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

  function startDownload() {
    if (!file) {
      return;
    }

    const targetUrl = file.hasPassword
      ? access?.downloadUrl || buildDownloadPath(uuid, access?.accessKey)
      : buildDownloadPath(uuid);

    window.location.assign(targetUrl);
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
            <div className="mb-3 flex size-12 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 text-white">
              <ShieldAlert className="size-5" />
            </div>
            <CardTitle>Password verification required</CardTitle>
            <CardDescription>
              The backend rejects protected downloads without a valid `accessKey` query parameter. Verify first, then the file can be downloaded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-muted">
              Once the password is verified, this client stores the temporary access payload in session storage and forwards you to the real backend download route.
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
    <Card className="mx-auto max-w-3xl rounded-[36px] p-2">
      <div className="rounded-[30px] bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-950 p-8 text-white">
        <p className="text-sm uppercase tracking-[0.24em] text-white/60">Download gateway</p>
        <h1 className="mt-3 text-3xl font-semibold">{file.fileName}</h1>
        <p className="mt-3 text-sm leading-7 text-white/72">
          This page maps to `GET /files/download/:uuid`. For password-protected transfers, the backend-issued access key is appended automatically.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            className="bg-white text-slate-950 hover:bg-white/90"
            onClick={startDownload}
          >
            <DownloadCloud className="size-4" />
            Start download
          </Button>
          {file.hasPassword ? (
            <Button
              type="button"
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/16"
              onClick={() => clearAccess(uuid)}
            >
              Clear access key
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
