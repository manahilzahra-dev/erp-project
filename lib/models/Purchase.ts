import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPurchaseItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  unitCost: number; // Kitne ka pada
  total: number;
}

export interface IPurchase extends Document {
  purchaseOrderNumber: string;
  supplierId: mongoose.Types.ObjectId;
  items: IPurchaseItem[];
  totalAmount: number;
  status: "pending" | "received" | "cancelled";
  date: Date;
}

const purchaseItemSchema = new Schema<IPurchaseItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitCost: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
});

const purchaseSchema = new Schema<IPurchase>(
  {
    purchaseOrderNumber: { type: String, required: true, unique: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    items: [purchaseItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "received", "cancelled"],
      default: "pending",
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Purchase: Model<IPurchase> =
  mongoose.models.Purchase || mongoose.model<IPurchase>("Purchase", purchaseSchema);

export default Purchase;