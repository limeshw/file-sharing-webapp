import { FileIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card.jsx";
import { buildDownloadPath } from "../services/file-service.js";

export function FilePreviewCard({ file, accessKey }) {
  const isImage = file.mimeType?.startsWith("image/");
  const isVideo = file.mimeType?.startsWith("video/");

  // We use the download endpoint for previews so the accessKey is validated correctly!
  const previewUrl = buildDownloadPath(file.uuid, accessKey);

  return (
    <Card className="rounded-[32px] overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 flex flex-col h-full border-border/50">
      <CardContent className="p-0 flex-grow flex items-center justify-center min-h-[400px]">
        {isImage ? (
          <div className="w-full h-full p-4 flex items-center justify-center bg-black/5 dark:bg-black/20">
            <img
              src={previewUrl}
              alt={file.fileName}
              className="max-w-full max-h-[500px] object-contain rounded-2xl shadow-sm"
              loading="lazy"
            />
          </div>
        ) : isVideo ? (
          <div className="w-full h-full p-4 flex items-center justify-center bg-black/5 dark:bg-black/20">
            <video
              src={previewUrl}
              controls
              className="max-w-full max-h-[500px] object-contain rounded-2xl shadow-sm bg-black"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-4">
            <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-500/10 rounded-[32px] flex items-center justify-center rotate-3 transition-transform hover:rotate-6">
              <FileIcon className="size-16 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-lg font-medium text-foreground">{file.fileName}</p>
              <p className="text-sm">Preview not available for this file type</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
