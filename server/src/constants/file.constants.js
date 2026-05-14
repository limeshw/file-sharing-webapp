export const MAX_FILE_SIZE = 100 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/zip": [".zip"],
  "application/x-zip-compressed": [".zip"],
};

export const BLOCKED_EXTENSIONS = [
  ".exe",
  ".js",
  ".apk",
  ".bat",
  ".cmd",
  ".com",
  ".msi",
  ".sh",
  ".bash",
  ".zsh",
  ".ps1",
  ".scr",
];

export const EXPIRY_OPTIONS = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

export const EXPIRY_LABELS = {
  "1h": "1 hour",
  "24h": "24 hours",
  "7d": "7 days",
};

export const FILE_INPUT_FIELD = "myfile";
