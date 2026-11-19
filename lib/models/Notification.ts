import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId; // Kis user ke liye notification hai
  title: string;
  message: string;
  isRead: boolean;
  type: "info" | "success" | "warning" | "error";
  link?: string; // Kahan jana hai click karne pe (optional)
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    link: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;