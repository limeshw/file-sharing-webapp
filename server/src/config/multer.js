import multer from "multer";
import { FILE_INPUT_FIELD, MAX_FILE_SIZE } from "../constants/file.constants.js";
import { HTTP_STATUS } from "../constants/http.constants.js";
import { AppError } from "../utils/appError.js";
import { isAllowedFile } from "../utils/file.util.js";

const fileFilter = (req, file, cb) => {
  if (!isAllowedFile(file)) {
    cb(
      new AppError(
        "Invalid file type. Only PDF, images, DOC, DOCX, and ZIP files are allowed.",
        HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE,
      ),
    );
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

export const singleFileUploadMiddleware = upload.single(FILE_INPUT_FIELD);
