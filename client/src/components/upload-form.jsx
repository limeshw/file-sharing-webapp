import { useRef, useState } from "react";
import { CloudUpload, FileIcon, LockKeyhole, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { ALLOWED_FORMATS, EXPIRY_OPTIONS, MAX_FILE_SIZE, RECENT_UPLOADS_KEY } from "../lib/constants.js";
import { formatBytes, getErrorMessage } from "../lib/utils.js";
import { uploadFile } from "../services/file-service.js";
import { useLocalStorage } from "../hooks/use-local-storage.js";
import { Button } from "./ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.jsx";
import { Input } from "./ui/input.jsx";
import { Progress } from "./ui/progress.jsx";
import { UploadResultPanel } from "./upload-result-panel.jsx";

export function UploadForm() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [expiry, setExpiry] = useState("24h");
  const [password, setPassword] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [, setRecentUploads] = useLocalStorage(RECENT_UPLOADS_KEY, []);
  const fileInputRef = useRef(null);

  function updateRecentUploads(data) {
    setRecentUploads((currentUploads) => {
      const nextUpload = {
        uuid: data.uuid,
        originalName: data.originalName,
        size: data.size,
        expiresAt: data.expiresAt,
        hasPassword: data.hasPassword,
        createdAt: new Date().toISOString(),
      };

      return [nextUpload, ...currentUploads.filter((item) => item.uuid !== data.uuid)].slice(0, 12);
    });
  }

  function handleFiles(fileList) {
    const file = fileList?.[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 100MB limit.");
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      toast.error("Select a file before uploading.");
      return;
    }

    if (password && password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const response = await uploadFile(
        { file: selectedFile, expiry, password: password.trim() },
        (eventPayload) => {
          if (!eventPayload.total) {
            return;
          }

          setProgress(Math.round((eventPayload.loaded * 100) / eventPayload.total));
        },
      );

      setUploadResult(response.data);
      updateRecentUploads(response.data);
      toast.success(response.message);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to upload file."));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div id="upload-panel" className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="rounded-[32px]">
        <CardHeader>
          <CardTitle>Upload a file</CardTitle>
          <CardDescription>
            Backend contract: multipart field must be `myfile`, expiry must be `1h`, `24h`, or `7d`, and password is optional with a 6 character minimum.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <button
              type="button"
              className={`group w-full rounded-[30px] border border-dashed p-6 text-left transition ${
                isDragging
                  ? "border-accent bg-blue-500/8"
                  : "border-border bg-white/45 hover:border-accent/40 hover:bg-white/60 dark:bg-slate-950/20"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                handleFiles(event.dataTransfer.files);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
              />
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex size-14 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 text-white shadow-lg shadow-blue-500/20">
                  <CloudUpload className="size-6" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Drop a file here or browse</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Allowed: {ALLOWED_FORMATS.join(", ")}. Maximum file size is {formatBytes(MAX_FILE_SIZE)}.
                  </p>
                </div>
              </div>

              {selectedFile ? (
                <div className="mt-5 flex items-center justify-between rounded-3xl bg-white/70 px-4 py-3 dark:bg-slate-950/30">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                      <FileIcon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted">{formatBytes(selectedFile.size)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted">Ready to upload</p>
                </div>
              ) : null}
            </button>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-medium">Link expiry</p>
                <div className="grid grid-cols-3 gap-2">
                  {EXPIRY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`rounded-2xl border px-3 py-3 text-sm transition ${
                        expiry === option.value
                          ? "border-accent bg-accent text-accent-foreground shadow-lg shadow-blue-500/20"
                          : "border-border bg-white/60 text-muted hover:bg-white/80 dark:bg-slate-950/20"
                      }`}
                      onClick={() => setExpiry(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium" htmlFor="password">
                  <LockKeyhole className="size-4" />
                  Optional password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  placeholder="At least 6 characters"
                  onChange={(event) => setPassword(event.target.value)}
                />
                <p className="flex items-center gap-2 text-xs text-muted">
                  <ShieldAlert className="size-3.5" />
                  Password-protected files require a verified access key before download.
                </p>
              </div>
            </div>

            {isUploading ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading to `/api/files/upload`</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Create secure share link"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <UploadResultPanel result={uploadResult} />
    </div>
  );
}
