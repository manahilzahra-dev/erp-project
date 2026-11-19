import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { requireRole, AuthError } from "@/lib/auth";

// ==========================================
// PUT: Update a product
// ==========================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Next.js 15+ mein params ek Promise hota hai, isliye await karte hain
    const { id } = await params;

    // Sirf Admin aur Inventory update kar sakte hain
    requireRole(req, ["admin", "inventory"]);

    const body = await req.json();
    
    // SKU ko uppercase karo agar update ho raha hai
    if (body.sku) {
      body.sku = body.sku.toUpperCase();
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product updated", product });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    if (error instanceof Error && "code" in error && error.code === 11000) {
       return NextResponse.json({ success: false, message: "SKU already exists" }, { status: 409 });
    }
    console.error("PUT Product Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// DELETE: Delete a product
// ==========================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Next.js 15+ mein params ek Promise hota hai
    const { id } = await params;

    // Sirf Admin delete kar sakta hai
    requireRole(req, ["admin"]);

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("DELETE Product Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}