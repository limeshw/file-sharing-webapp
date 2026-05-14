export const sendSuccess = (res, statusCode, message, data = {}) =>
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });

export const sendError = (res, statusCode, message, details = null) =>
  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
