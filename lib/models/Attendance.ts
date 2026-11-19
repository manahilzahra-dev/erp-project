import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttendance extends Document {
  employeeId: mongoose.Types.ObjectId; // Reference to Employee
  date: Date;
  status: "present" | "absent" | "leave" | "half-day";
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee", // Ye batata hai ke ye ID Employee model se hai
      required: [true, "Employee ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    status: {
      type: String,
      enum: ["present", "absent", "leave", "half-day"],
      default: "present",
    },
    checkInTime: {
      type: String,
      trim: true,
    },
    checkOutTime: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Ek employee ki ek din mein sirf ek attendance ho sakti hai
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", attendanceSchema);

export default Attendance;