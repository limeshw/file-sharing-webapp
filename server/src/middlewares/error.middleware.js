import multer from "multer";
import mongoose from "mongoose";

import { HTTP_STATUS } from "../constants/http.constants.js";
import { sendError } from "../utils/apiResponse.js";

const resolveError = (error) => {
  if (error.name === "CastError") {
    return {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: "Invalid resource identifier.",
    };
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return {
        statusCode: HTTP_STATUS.PAYLOAD_TOO_LARGE,
        message: "File size exceeds 100MB limit.",
      };
    }

    return {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: error.message,
    };
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return {
      statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message: "Validation failed.",
      details: Object.values(error.errors).map((item) => item.message),
    };
  }

  if (error.http_code) {
    return {
      statusCode: error.http_code,
      message: error.message || "Cloudinary request failed.",
    };
  }

  return {
    statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: error.message || "Internal server error.",
    details: error.details || null,
  };
};

export const notFoundHandler = (req, res) =>
  sendError(res, HTTP_STATUS.NOT_FOUND, "Route not found.");

export const errorHandler = (error, req, res, next) => {
  const { statusCode, message, details } = resolveError(error);

  if (statusCode >= 400) {
    console.error(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${statusCode} ${message}`,
      details || "",
    );
  }

  sendError(res, statusCode, message, details);
};
