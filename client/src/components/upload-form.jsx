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
import { Badge } from "./ui/badge.jsx";
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
  const resultRef = useRef(null);

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
      toast.error("File size exceeds 10MB limit.");
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
      setSelectedFile(null);
      setPassword("");
      setProgress(100);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      toast.success("Share link created.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to upload file."));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div id="upload-panel" className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
      <Card className="glass-panel-strong rounded-[32px] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <CardHeader className="relative z-10 pb-2">
          <CardTitle className="text-2xl">Create a secure share link</CardTitle>
          <CardDescription className="text-base">
            Choose a file, set how long the link should stay active, and add a password only if you need one.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 pt-4">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <button
              type="button"
              className={`group w-full rounded-[28px] border-2 border-dashed p-8 text-left transition-all duration-300 ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 scale-[1.01]"
                  : "border-border bg-slate-50/50 hover:border-indigo-400 hover:bg-slate-50/80 dark:bg-slate-900/50 dark:hover:bg-slate-800/50"
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
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className={`flex size-16 items-center justify-center rounded-2xl transition-colors duration-300 ${isDragging ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20'}`}>
                  <CloudUpload className="size-7" />
                </div>
                <div>
                  <p className="text-xl font-semibold">Drop a file here or browse</p>
                  <p className="mt-1.5 text-sm leading-6 text-muted">
                    {ALLOWED_FORMATS.join(", ")} supported. Up to {formatBytes(MAX_FILE_SIZE)}.
                  </p>
                </div>
              </div>

              {selectedFile ? (
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-border/50 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm dark:bg-slate-900/80">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      <FileIcon className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{selectedFile.name}</p>
                      <p className="text-xs text-muted">{formatBytes(selectedFile.size)}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Selected</Badge>
                </div>
              ) : null}
            </button>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-semibold">Link expires in</p>
                <div className="grid grid-cols-3 gap-2">
                  {EXPIRY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`rounded-2xl border px-3 py-3.5 text-sm font-medium transition-all duration-200 ${
                        expiry === option.value
                          ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                          : "border-border bg-white/50 text-muted hover:border-indigo-300 hover:text-foreground dark:bg-slate-900/50"
                      }`}
                      onClick={() => setExpiry(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold" htmlFor="password">
                  <LockKeyhole className="size-4" />
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  placeholder="Optional"
                  className="rounded-2xl h-12 bg-white/50 dark:bg-slate-900/50 focus-visible:ring-indigo-500/30"
                  onChange={(event) => setPassword(event.target.value)}
                />
                <p className="flex items-center gap-2 text-xs text-muted">
                  <ShieldAlert className="size-3.5" />
                  Leave empty for public access.
                </p>
              </div>
            </div>

            {isUploading ? (
              <div className="rounded-2xl border border-border/50 bg-indigo-50/50 p-5 backdrop-blur-sm dark:bg-indigo-500/5">
                <div className="mb-3 flex items-center justify-between text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  <span>Uploading secure file...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ) : null}

            <Button type="submit" size="lg" className="w-full rounded-2xl h-14 text-base font-semibold" disabled={isUploading}>
              {isUploading ? "Processing..." : "Create secure share link"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div ref={resultRef}>
        <UploadResultPanel result={uploadResult} />
      </div>
    </div>
  );
}
