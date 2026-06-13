import multer from "multer";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { FILE_INPUT_FIELD, MAX_FILE_SIZE } from "../constants/file.constants.js";
import { HTTP_STATUS } from "../constants/http.constants.js";
import { AppError } from "../utils/appError.js";
import { isAllowedFile } from "../utils/file.util.js";

const fileFilter = (req, file, cb) => {
  if (!isAllowedFile(file)) {
    cb(
      new AppError(
        "Invalid file type. Allowed formats: PDF, images, documents, zip, and common code/text files.",
        HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE,
      ),
    );
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${randomUUID()}${path.extname(file.originalname)}`);
    }
  }),
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

export const singleFileUploadMiddleware = upload.single(FILE_INPUT_FIELD);
