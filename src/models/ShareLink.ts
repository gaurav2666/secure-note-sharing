import mongoose, { Document, Model, Schema } from "mongoose";

export type ShareType = "one-time" | "time-based";
export type AccessType = "public" | "password";

export interface IShareLink extends Document {
  noteId: mongoose.Types.ObjectId;
  ownerId: string;

  token: string;

  shareType: ShareType;
  accessType: AccessType;

  expiresAt: Date;

  passwordHash?: string;

  viewCount: number;

  failedAttempts: number;
lockedUntil?: Date | null;

  usedAt?: Date | null;
  revokedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const shareLinkSchema = new Schema<IShareLink>(
  {
    noteId: {
      type: Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },

    ownerId: {
      type: String,
      required: true,
      index: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    shareType: {
      type: String,
      enum: ["one-time", "time-based"],
      required: true,
    },

    accessType: {
      type: String,
      enum: ["public", "password"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    passwordHash: {
      type: String,
    },

    viewCount: {
      type: Number,
      default: 0,
    },

    failedAttempts: {
      type: Number,
      default: 0,
    },

    usedAt: {
      type: Date,
      default: null,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ShareLink: Model<IShareLink> =
  mongoose.models.ShareLink ||
  mongoose.model<IShareLink>("ShareLink", shareLinkSchema);

export default ShareLink;