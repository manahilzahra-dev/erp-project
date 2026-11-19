import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  user: mongoose.Types.ObjectId; // Kis user ne kiya
  action: string; // Kya kiya (e.g., "CREATE", "UPDATE", "DELETE")
  module: string; // Kis module mein (e.g., "Employee", "Invoice", "Leave")
  details: string; // Kya details (e.g., "Created employee Ali Khan")
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

export default AuditLog;