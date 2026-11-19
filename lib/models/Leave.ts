import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILeave extends Document {
  employeeId: mongoose.Types.ObjectId;
  leaveType: "sick" | "casual" | "annual" | "unpaid";
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "pending" | "approved" | "rejected";
  totalDays: number;
}

const leaveSchema = new Schema<ILeave>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee is required"],
    },
    leaveType: {
      type: String,
      enum: ["sick", "casual", "annual", "unpaid"],
      required: [true, "Leave type is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    totalDays: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Leave: Model<ILeave> =
  mongoose.models.Leave || mongoose.model<ILeave>("Leave", leaveSchema);

export default Leave;