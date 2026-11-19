import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISupplier extends Document {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  status: "active" | "inactive";
}

const supplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
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
      required: [true, "Phone is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Supplier: Model<ISupplier> =
  mongoose.models.Supplier || mongoose.model<ISupplier>("Supplier", supplierSchema);

export default Supplier;