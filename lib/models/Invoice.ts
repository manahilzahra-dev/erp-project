import mongoose, { Schema, Document, Model } from "mongoose";

// Invoice ke andar har product ka structure
export interface IInvoiceItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  customerId: mongoose.Types.ObjectId;
  items: IInvoiceItem[];
  subTotal: number;
  taxRate: number; // e.g., 17 for 17%
  taxAmount: number;
  grandTotal: number;
  status: "unpaid" | "paid" | "cancelled";
  date: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
});

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [invoiceItemSchema],
    subTotal: { type: Number, required: true },
    taxRate: { type: Number, required: true, default: 17 }, // Default 17% GST
    taxAmount: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ["unpaid", "paid", "cancelled"],
      default: "unpaid",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", invoiceSchema);

export default Invoice;