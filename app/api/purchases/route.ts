import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Purchase from "@/lib/models/Purchase";
import Product from "@/lib/models/Product";
import Supplier from "@/lib/models/Supplier"; // populate ke liye
import { requireRole, AuthError } from "@/lib/auth";
void Supplier;
// GET: Fetch all purchase orders
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "inventory", "management"]);

    const purchases = await Purchase.find({})
      .populate("supplierId", "name company")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, purchases });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// POST: Create a Purchase Order
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "inventory"]);

    const body = await req.json();
    const { supplierId, items } = body;

    if (!supplierId || !items || items.length === 0) {
      return NextResponse.json({ success: false, message: "Supplier and items required" }, { status: 400 });
    }

    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
      }
      
      const itemTotal = product.costPrice * item.quantity; // Cost price use karo, selling price nahi
      totalAmount += itemTotal;

      processedItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitCost: product.costPrice,
        total: itemTotal,
      });
    }

    const purchaseOrderNumber = `PO-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const purchase = await Purchase.create({
      purchaseOrderNumber,
      supplierId,
      items: processedItems,
      totalAmount,
      status: "pending", // Jab tak maal receive nahi hota
    });

    return NextResponse.json({ success: true, message: "✅ Purchase Order created", purchase }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}