
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


  if (error instanceof mongoose.Error.ValidationError) {
    return {
      statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message: "Validation failed.",
      details: Object.values(error.errors).map((item) => item.message),
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
