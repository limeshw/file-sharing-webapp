import { HTTP_STATUS } from "../constants/http.constants.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getFileByUuid, resolveDownload, resolvePreview, buildFileViewModel } from "../services/file.service.js";
import { validateUuid } from "../validators/file.validator.js";
import { AppError } from "../utils/appError.js";
import { getR2PresignedDownloadUrl, getR2PresignedPreviewUrl } from "../services/r2.service.js";

export const showFilePage = asyncHandler(async (req, res) => {
  try {
    validateUuid(req.params.uuid);
    const file = await getFileByUuid(req.params.uuid);

    return res.render("download", {
      error: null,
      ...buildFileViewModel(file),
    });
  } catch (error) {
    return res.status(
      error.statusCode === HTTP_STATUS.GONE
        ? HTTP_STATUS.GONE
        : HTTP_STATUS.NOT_FOUND,
    ).render("download", {
      error: error.message,
    });
  }
});

export const downloadFile = asyncHandler(async (req, res) => {
  validateUuid(req.params.uuid);

  const file = await resolveDownload({
    uuid: req.params.uuid,
    accessKey: req.query.accessKey,
  });

  const presignedUrl = await getR2PresignedDownloadUrl(file.public_id, file.originalName);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Download URL generated",
    data: { downloadUrl: presignedUrl },
  });
});

export const fileInfo = asyncHandler(async (req, res) => {
  validateUuid(req.params.uuid);
  const file = await getFileByUuid(req.params.uuid);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "File fetched successfully",
    data: buildFileViewModel(file),
  });
});

export const previewFile = asyncHandler(async (req, res) => {
  validateUuid(req.params.uuid);
  const file = await resolvePreview({
    uuid: req.params.uuid,
    accessKey: req.query.accessKey,
  });

  const presignedUrl = await getR2PresignedPreviewUrl(file.public_id);

  res.redirect(presignedUrl);
});
