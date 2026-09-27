import mongoose, { Schema, Document, Model } from "mongoose";

export interface INote extends Document {
  ownerId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    ownerId: {
      type: String,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Note: Model<INote> =
  mongoose.models.Note || mongoose.model<INote>("Note", noteSchema);

export default Note;