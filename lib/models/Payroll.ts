import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayroll extends Document {
  employeeId: mongoose.Types.ObjectId;
  month: string; // Format: "2026-11" (Year-Month)
  basicSalary: number;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  deductions: number;
  netSalary: number;
  status: "pending" | "paid";
}

const payrollSchema = new Schema<IPayroll>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    basicSalary: { type: Number, required: true },
    totalWorkingDays: { type: Number, required: true },
    presentDays: { type: Number, required: true },
    absentDays: { type: Number, required: true },
    deductions: { type: Number, required: true },
    netSalary: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Ek employee ki ek mahine mein sirf ek payslip ban sakti hai
payrollSchema.index({ employeeId: 1, month: 1 }, { unique: true });

const Payroll: Model<IPayroll> =
  mongoose.models.Payroll || mongoose.model<IPayroll>("Payroll", payrollSchema);

export default Payroll;