import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    uuid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    public_id: {
      type: String,
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
    },
    hasPassword: {
      type: Boolean,
      default: false,
    },
    expiryOption: {
      type: String,
      enum: ["1h", "24h", "7d"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },

    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    sender: {
      type: String,
      default: null,
      trim: true,
    },
    receiver: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
  },
);

export const File = mongoose.model("File", fileSchema);
