import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Purchase from "@/lib/models/Purchase";
import Product from "@/lib/models/Product";
import Transaction from "@/lib/models/Transaction";
import { requireRole, AuthError } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    requireRole(req, ["admin", "inventory"]);

    const body = await req.json();
    const { status } = body;

    if (status !== "received") {
      return NextResponse.json({ success: false, message: "Invalid status update" }, { status: 400 });
    }

    const purchase = await Purchase.findById(id);
    if (!purchase) {
      return NextResponse.json({ success: false, message: "Purchase Order not found" }, { status: 404 });
    }

    if (purchase.status !== "pending") {
      return NextResponse.json({ success: false, message: "Order already received or cancelled" }, { status: 400 });
    }

    // ✅ 1. Status update karo
    purchase.status = "received";
    await purchase.save();

    // ✅ 2. Stock badhao (Product quantity increase)
    for (const item of purchase.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: item.quantity },
      });
    }

    // ✅ 3. Finance mein Expense auto-record karo
    await Transaction.create({
      type: "expense",
      amount: purchase.totalAmount,
      description: `Purchase Order: ${purchase.purchaseOrderNumber}`,
      reference: purchase.purchaseOrderNumber,
    });

    return NextResponse.json({ success: true, message: "✅ Order received & stock updated", purchase });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("PUT Purchase Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    requireRole(req, ["admin"]);

    const purchase = await Purchase.findById(id);
    if (!purchase) {
      return NextResponse.json({ success: false, message: "Purchase not found" }, { status: 404 });
    }

    // Agar order pending tha, toh delete kar do. Agar received tha, toh stock wapas kam karo
    if (purchase.status === "received") {
      for (const item of purchase.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stockQuantity: -item.quantity },
        });
      }
      // Note: Finance expense delete karna is complex, hum abhi skip kar rahe hain.
    }

    await Purchase.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Purchase deleted" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("DELETE Purchase Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}