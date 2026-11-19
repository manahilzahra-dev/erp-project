import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/lib/models/Invoice";
import Product from "@/lib/models/Product";
import Transaction from "@/lib/models/Transaction"; // <-- NAYA IMPORT
import { requireRole, AuthError } from "@/lib/auth";

// ==========================================
// PUT: Update Invoice Status & Auto-Income
// ==========================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Sirf Admin aur Sales status change kar sakte hain
    requireRole(req, ["admin", "sales"]);

    const body = await req.json();
    const { status } = body; // "paid" ya "cancelled"

    if (!["paid", "cancelled"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }

    // Pehle invoice dhundo (validation ke liye)
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
    }

    // Agar pehle se same status hai, toh dobara process mat karo
    if (invoice.status === status) {
      return NextResponse.json({ success: true, message: `Invoice already ${status}`, invoice });
    }

    // Status update karo
    invoice.status = status;
    await invoice.save();

    // ✅ WORKFLOW AUTOMATION: Agar invoice "paid" hui, toh Finance mein Income auto-add karo
    if (status === "paid") {
      await Transaction.create({
        type: "income",
        amount: invoice.grandTotal,
        description: `Payment received for Invoice ${invoice.invoiceNumber}`,
        reference: invoice.invoiceNumber,
      });
    }

    return NextResponse.json({ success: true, message: `Invoice marked as ${status}`, invoice });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("PUT Invoice Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// DELETE: Delete Invoice (and restore stock)
// ==========================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Sirf Admin delete kar sakta hai
    requireRole(req, ["admin"]);

    // 1. Pehle invoice dhundo (stock wapas badhane ke liye)
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
    }

    // 2. Stock wapas badhao (Restore Stock)
    if (invoice.status !== "cancelled") {
      for (const item of invoice.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stockQuantity: item.quantity }, // +quantity se stock wapas badhta hai
        });
      }
    }

    // 3. Ab Invoice delete karo
    await Invoice.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Invoice deleted & stock restored" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("DELETE Invoice Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}