import { EXPIRY_OPTIONS } from "../constants/file.constants.js";
import { HTTP_STATUS } from "../constants/http.constants.js";
import { AppError } from "../utils/appError.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const validateUploadPayload = ({ expiry, password }) => {
  if (!expiry || !EXPIRY_OPTIONS[expiry]) {
    throw new AppError(
      "Invalid expiry selection. Allowed values are 1h, 24h, or 7d.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (password && String(password).length < 6) {
    throw new AppError(
      "Password must be at least 6 characters long.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};

export const validateUuid = (uuid) => {
  if (!uuid || !UUID_REGEX.test(uuid)) {
    throw new AppError("Invalid file identifier.", HTTP_STATUS.BAD_REQUEST);
  }
};

export const validatePasswordPayload = ({ uuid, password }) => {
  validateUuid(uuid);

  if (!password) {
    throw new AppError("Password is required.", HTTP_STATUS.BAD_REQUEST);
  }
};

export const validateEmailPayload = ({ uuid, emailTo, emailFrom }) => {
  validateUuid(uuid);

  if (!emailTo || !emailFrom) {
    throw new AppError(
      "uuid, emailTo, and emailFrom are required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};
