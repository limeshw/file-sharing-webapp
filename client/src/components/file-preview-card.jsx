import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FileIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "./ui/card.jsx";
import { buildPreviewPath } from "../services/file-service.js";

export function FilePreviewCard({ file, accessKey }) {
  const isImage = file.mimeType?.startsWith("image/");
  const isVideo = file.mimeType?.startsWith("video/");
  const isPdf = file.mimeType === "application/pdf";
  
  const isDoc = useMemo(() => {
    return (
      /\.(doc|docx)$/i.test(file.fileName) ||
      ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.mimeType)
    );
  }, [file.mimeType, file.fileName]);
  
  const isText = useMemo(() => {
    return (
      file.mimeType?.startsWith("text/") || 
      ["application/json", "application/javascript", "application/xml"].includes(file.mimeType) ||
      /\.(js|jsx|ts|tsx|py|css|html|md|json|cpp|h|cs|go|rs|sh|yaml|yml|xml)$/i.test(file.fileName)
    );
  }, [file.mimeType, file.fileName]);

  const previewUrl = buildPreviewPath(file.uuid, accessKey);

  const [textContent, setTextContent] = useState("");
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState("");

  useEffect(() => {
    if (!isText) return;

    let active = true;
    setTextLoading(true);
    setTextError("");

    axios
      .get(previewUrl, { responseType: "text" })
      .then((response) => {
        if (active) {
          setTextContent(response.data);
          setTextLoading(false);
        }
      })
      .catch((error) => {
        if (active) {
          console.error("Failed to fetch text content for preview", error);
          setTextError("Unable to load file preview content.");
          setTextLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [previewUrl, isText]);

  const displayContent = useMemo(() => {
    if (!textContent) return "";
    
    // Auto-format JSON for clean rendering
    if (file.fileName?.endsWith(".json") || file.mimeType === "application/json") {
      try {
        return JSON.stringify(JSON.parse(textContent), null, 2);
      } catch {
        return textContent;
      }
    }
    return textContent;
  }, [textContent, file.fileName, file.mimeType]);

  return (
    <Card className="rounded-xl overflow-hidden bg-secondary/10 flex flex-col h-full border border-border/50 shadow min-w-0">
      <CardContent className="p-0 flex-grow flex items-center justify-center min-h-[450px] min-w-0 w-full">
        {isImage ? (
          <div className="w-full h-full p-4 flex items-center justify-center bg-black/5 dark:bg-black/20">
            <img
              src={previewUrl}
              alt={file.fileName}
              className="max-w-full max-h-[500px] object-contain rounded-lg shadow-md"
              loading="lazy"
            />
          </div>
        ) : isVideo ? (
          <div className="w-full h-full p-4 flex items-center justify-center bg-black/5 dark:bg-black/20">
            <video
              src={previewUrl}
              controls
              className="max-w-full max-h-[500px] object-contain rounded-lg shadow-md bg-black"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : isPdf ? (
          <div className="w-full h-full p-4 min-h-[500px] flex flex-col bg-black/5 dark:bg-black/20 w-full">
            <iframe
              src={`${previewUrl}#toolbar=0`}
              className="w-full h-[500px] border-0 rounded-lg shadow-md bg-white"
              title={file.fileName}
            />
          </div>
        ) : isDoc ? (
          <div className="w-full h-full p-4 min-h-[500px] flex flex-col bg-black/5 dark:bg-black/20 w-full">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`}
              className="w-full h-[500px] border-0 rounded-lg shadow-md bg-white"
              title={file.fileName}
            />
          </div>
        ) : isText ? (
          <div className="w-full h-full p-4 flex flex-col bg-black/5 dark:bg-black/20 min-h-[450px] justify-start items-stretch min-w-0">
            {textLoading ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-3 min-h-[300px]">
                <Loader2 className="size-8 text-primary animate-spin" />
                <p className="text-sm font-medium">Reading file contents...</p>
              </div>
            ) : textError ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-4">
                <div className="w-20 h-20 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-center">
                  <FileIcon className="size-10 text-destructive" />
                </div>
                <p className="text-sm font-medium text-destructive">{textError}</p>
              </div>
            ) : (
              <div className="w-full text-left bg-slate-950 dark:bg-slate-900 border border-slate-800/80 rounded-lg shadow-inner overflow-hidden flex flex-col max-h-[500px] min-w-0">
                {/* Header for text/code viewer */}
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900 dark:bg-slate-800/60 border-b border-slate-800 text-[11px] text-slate-400 font-mono select-none">
                  <span className="truncate pr-4">{file.fileName}</span>
                  <span className="uppercase text-slate-500 shrink-0">{file.mimeType?.split("/")[1] || "text"}</span>
                </div>
                <pre className="p-4 overflow-auto text-xs font-mono leading-relaxed text-slate-100 select-text max-h-[450px] min-w-0 w-full">
                  <code>{displayContent}</code>
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-4">
            <div className="w-32 h-32 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center rotate-3 transition-transform hover:rotate-6 duration-300">
              <FileIcon className="size-16 text-primary" />
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-lg font-medium text-foreground">{file.fileName}</p>
              <p className="text-sm text-muted-foreground">Preview not available for this file type</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
