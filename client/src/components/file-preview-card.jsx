import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { FileIcon, Loader2, Music, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Card, CardContent } from "./ui/card.jsx";
import { Button } from "./ui/button.jsx";
import { buildPreviewPath } from "../services/file-service.js";
import { Document, Page, pdfjs } from "react-pdf";
import { renderAsync } from "docx-preview";

// Configure PDF.js worker via unpkg CDN matching the installed pdfjs-dist/react-pdf version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function FilePreviewCard({ file, accessKey }) {
  const isImage = file.mimeType?.startsWith("image/");
  const isVideo = file.mimeType?.startsWith("video/");
  const isPdf = file.mimeType === "application/pdf";
  
  const isDocx = useMemo(() => {
    return (
      /\.docx$/i.test(file.fileName) ||
      file.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  }, [file.mimeType, file.fileName]);

  const isDoc = useMemo(() => {
    return (
      /\.doc$/i.test(file.fileName) ||
      file.mimeType === "application/msword"
    );
  }, [file.mimeType, file.fileName]);

  const isAudio = useMemo(() => {
    return (
      file.mimeType?.startsWith("audio/") ||
      ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"].includes(file.mimeType)
    );
  }, [file.mimeType]);
  
  const isText = useMemo(() => {
    return (
      file.mimeType?.startsWith("text/") || 
      ["application/json", "application/javascript", "application/xml"].includes(file.mimeType) ||
      /\.(js|jsx|ts|tsx|py|css|html|md|json|cpp|h|cs|go|rs|sh|yaml|yml|xml)$/i.test(file.fileName)
    );
  }, [file.mimeType, file.fileName]);

  const previewUrl = buildPreviewPath(file.uuid, accessKey);

  // Text state
  const [textContent, setTextContent] = useState("");
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState("");

  // PDF states
  const [pdfBlobUrl, setPdfBlobUrl] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  // DOCX states
  const docxContainerRef = useRef(null);
  const [docxLoading, setDocxLoading] = useState(false);
  const [docxError, setDocxError] = useState("");

  // Load Text content
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

  // Load PDF content
  useEffect(() => {
    if (!isPdf) return;

    let active = true;
    let url = "";
    setPdfLoading(true);
    setPdfError("");
    setPdfBlobUrl("");

    axios
      .get(previewUrl, { responseType: "blob" })
      .then((response) => {
        if (active) {
          url = URL.createObjectURL(response.data);
          setPdfBlobUrl(url);
          setPdfLoading(false);
        }
      })
      .catch((error) => {
        if (active) {
          console.error("Failed to fetch PDF preview blob", error);
          setPdfError("Unable to load PDF document.");
          setPdfLoading(false);
        }
      });

    return () => {
      active = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [previewUrl, isPdf]);

  // Load and render DOCX content
  useEffect(() => {
    if (!isDocx) return;

    let active = true;
    setDocxLoading(true);
    setDocxError("");

    axios
      .get(previewUrl, { responseType: "blob" })
      .then(async (response) => {
        if (!active) return;
        try {
          if (docxContainerRef.current) {
            docxContainerRef.current.innerHTML = "";
            await renderAsync(response.data, docxContainerRef.current, undefined, {
              className: "docx",
              inWrapper: true,
              ignoreWidth: false,
              ignoreHeight: false,
              breakPages: true,
            });
            if (active) {
              setDocxLoading(false);
            }
          }
        } catch (err) {
          console.error("docx-preview rendering failed", err);
          if (active) {
            setDocxError("Failed to render Word document client-side.");
            setDocxLoading(false);
          }
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Failed to fetch DOCX preview file", err);
          setDocxError("Unable to load Word document preview.");
          setDocxLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [previewUrl, isDocx]);

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

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset) {
    setPageNumber(prevPage => {
      const next = prevPage + offset;
      return Math.max(1, Math.min(numPages, next));
    });
  }

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
        ) : isAudio ? (
          <div className="w-full h-full p-8 flex flex-col items-center justify-center bg-black/5 dark:bg-black/20 min-h-[450px] w-full">
            <div className="w-20 h-20 mb-6 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shadow-lg shadow-primary/5">
              <Music className="size-10 text-primary" />
            </div>
            <div className="w-full max-w-md px-4 py-3 bg-card rounded-xl border border-border/50 shadow flex flex-col gap-2">
              <p className="text-sm font-medium text-center truncate text-foreground mb-1" title={file.fileName}>
                {file.fileName}
              </p>
              <audio
                src={previewUrl}
                controls
                className="w-full"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        ) : isPdf ? (
          <div className="w-full h-full p-4 min-h-[500px] flex flex-col bg-black/5 dark:bg-black/20 w-full items-center justify-center">
            {pdfLoading ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-3 min-h-[300px]">
                <Loader2 className="size-8 text-primary animate-spin" />
                <p className="text-sm font-medium">Fetching PDF content...</p>
              </div>
            ) : pdfError ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-4">
                <div className="w-20 h-20 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="size-10 text-destructive" />
                </div>
                <p className="text-sm font-medium text-destructive">{pdfError}</p>
              </div>
            ) : pdfBlobUrl ? (
              <div className="flex flex-col items-center w-full gap-4">
                <div className="w-full flex justify-center overflow-auto max-h-[500px] bg-slate-900/10 dark:bg-black/40 p-2 rounded-lg border border-border/50">
                  <Document
                    file={pdfBlobUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="flex flex-col items-center justify-center p-12 text-center gap-3">
                        <Loader2 className="size-8 text-primary animate-spin" />
                        <p className="text-sm font-medium">Loading document pages...</p>
                      </div>
                    }
                    error={
                      <div className="flex flex-col items-center justify-center p-12 text-center text-destructive gap-2">
                        <AlertCircle className="size-8 text-destructive" />
                        <p className="text-sm font-medium">Failed to load PDF pages.</p>
                      </div>
                    }
                  >
                    <Page 
                      pageNumber={pageNumber} 
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                </div>
                {numPages && (
                  <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-lg border border-border/60 shadow-sm text-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changePage(-1)}
                      disabled={pageNumber <= 1}
                    >
                      <ChevronLeft className="size-4" />
                      Previous
                    </Button>
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      Page {pageNumber} of {numPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changePage(1)}
                      disabled={pageNumber >= numPages}
                    >
                      Next
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : isDocx ? (
          <div className="w-full h-full p-4 min-h-[500px] flex flex-col bg-black/5 dark:bg-black/20 w-full justify-center">
            {docxLoading && (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-3 min-h-[300px] w-full">
                <Loader2 className="size-8 text-primary animate-spin" />
                <p className="text-sm font-medium">Loading Word document...</p>
              </div>
            )}
            
            {docxError && (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-4 w-full">
                <div className="w-20 h-20 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="size-10 text-destructive" />
                </div>
                <p className="text-sm font-medium text-destructive">{docxError}</p>
              </div>
            )}

            <div
              className={`w-full h-[500px] overflow-auto p-4 bg-slate-900/10 dark:bg-black/40 rounded-lg border border-border/50 ${
                docxLoading || docxError ? "hidden" : "block"
              }`}
            >
              <div ref={docxContainerRef} className="w-full" />
            </div>
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
