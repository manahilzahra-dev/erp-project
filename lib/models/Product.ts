import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  sku: string; // Stock Keeping Unit (Unique Code)
  category: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  lowStockThreshold: number; // Jab stock is se kam ho toh alert
  description?: string;
  status: "active" | "inactive";
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
      uppercase: true, // SKU hamesha capital letters mein hoga
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Electronics", "Furniture", "Stationery", "Software", "Other"],
    },
    price: {
      type: Number,
      required: [true, "Selling price is required"],
      min: 0,
    },
    costPrice: {
      type: Number,
      required: [true, "Cost price is required"],
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10, // Default: agar 10 se kam bache toh alert
    },
    description: {
      type: String,
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

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export default Product;