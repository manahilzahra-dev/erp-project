import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  type: "income" | "expense";
  amount: number;
  description: string;
  reference?: string; // Invoice number ya kuch aur
  date: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", transactionSchema);

export default Transaction;