import QRCode from "qrcode";

export const generateQrCodeDataUrl = async (content) =>
  QRCode.toDataURL(content, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
  });
