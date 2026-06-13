import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { EmptyState } from "../components/empty-state.jsx";
import { FileMetadataCard } from "../components/file-metadata-card.jsx";
import { PasswordGateCard } from "../components/password-gate-card.jsx";
import { FilePreviewCard } from "../components/file-preview-card.jsx";
import { Skeleton } from "../components/ui/skeleton.jsx";
import { useDownloadAccess } from "../context/download-access-context.jsx";
import { getErrorMessage, isExpiredStatus } from "../lib/utils.js";
import { fetchFileMeta, downloadFileToDevice } from "../services/file-service.js";

export function FilePage() {
  const { uuid } = useParams();
  const { accessMap, saveAccess } = useDownloadAccess();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

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

  async function startDownload() {
    if (!file) return;

    if (file.hasPassword && !existingAccess) {
      toast.error("Please enter the password to download this file.");
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      await downloadFileToDevice({
        uuid,
        accessKey: existingAccess?.accessKey,
        filename: file.fileName,
      }, (event) => {
        if (event.total) {
          setDownloadProgress(Math.round((event.loaded * 100) / event.total));
        }
      });
      toast.success("Download complete.");
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "The file could not be downloaded automatically."
        )
      );
    } finally {
      setIsDownloading(false);
    }
  }

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
    <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr] h-full items-start">
      <div className="space-y-6 sticky top-6">
        <FileMetadataCard
          file={file}
          hasAccess={Boolean(existingAccess)}
          onDownload={startDownload}
          isDownloading={isDownloading}
          downloadProgress={downloadProgress}
        />
      </div>

      <div className="space-y-6">
        {file.hasPassword && !existingAccess ? (
          <PasswordGateCard
            uuid={uuid}
            onVerified={(accessPayload) => {
              saveAccess(uuid, accessPayload);
            }}
          />
        ) : (
          <FilePreviewCard file={file} accessKey={existingAccess?.accessKey} />
        )}
      </div>
    </div>
  );
}
