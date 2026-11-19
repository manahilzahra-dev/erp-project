import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmployee extends Document {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  joiningDate: Date;
  salary: number;
  status: "active" | "inactive" | "on-leave";
}

const employeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: ["Engineering", "HR", "Finance", "Sales", "Marketing", "Operations"],
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on-leave"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>("Employee", employeeSchema);

export default Employee;