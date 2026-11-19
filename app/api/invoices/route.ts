import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/lib/models/Invoice";
import Product from "@/lib/models/Product";
import Customer from "@/lib/models/Customer"; // populate ke liye
import { requireRole, AuthError } from "@/lib/auth";

// ==========================================
// GET: Fetch all invoices
// ==========================================
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "sales", "finance", "management"]);

    const invoices = await Invoice.find({})
      .populate("customerId", "name company email")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("GET Invoice Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// POST: Create a new Invoice
// ==========================================
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "sales"]);

    const body = await req.json();
    const { customerId, items, taxRate } = body;

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Customer and at least one item are required" },
        { status: 400 }
      );
    }

    // 1. Check karo ke customer exist karta hai
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }

    // 2. Process Items & Check Stock
    let subTotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ success: false, message: `Product not found: ${item.productId}` }, { status: 404 });
      }

      // Stock Check
      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock for ${product.name}. Only ${product.stockQuantity} left.` },
          { status: 400 }
        );
      }

      // Item Total Calculate karo
      const itemTotal = product.price * item.quantity;
      subTotal += itemTotal;

      processedItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        total: itemTotal,
      });
    }

    // 3. Tax & Grand Total Calculate karo
    const actualTaxRate = taxRate !== undefined ? taxRate : 17;
    const taxAmount = Math.round(subTotal * (actualTaxRate / 100));
    const grandTotal = subTotal + taxAmount;

    // 4. Invoice Number Generate karo (Unique)
    // Format: INV-<timestamp>-<random>
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // 5. Invoice Save karo
    const invoice = await Invoice.create({
      invoiceNumber,
      customerId,
      items: processedItems,
      subTotal,
      taxRate: actualTaxRate,
      taxAmount,
      grandTotal,
      status: "unpaid",
    });

    // 6. ✅ Stock Kam karo (Inventory Update)
    for (const item of processedItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: -item.quantity }, // -quantity se stock kam hota hai
      });
    }

    return NextResponse.json(
      { success: true, message: "✅ Invoice generated successfully", invoice },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("POST Invoice Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}