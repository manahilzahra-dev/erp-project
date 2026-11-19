import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExpense extends Document {
  title: string;
  category: "rent" | "utilities" | "salary" | "supplies" | "marketing" | "other";
  amount: number;
  date: Date;
  notes?: string;
}

const expenseSchema = new Schema<IExpense>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["rent", "utilities", "salary", "supplies", "marketing", "other"],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", expenseSchema);

export default Expense;