import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Supplier from "@/lib/models/Supplier";
import { requireRole, AuthError } from "@/lib/auth";

// ==========================================
// PUT: Update a supplier
// ==========================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    requireRole(req, ["admin", "inventory"]);

    const body = await req.json();
    if (body.email) body.email = body.email.toLowerCase();

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return NextResponse.json({ success: false, message: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Supplier updated", supplier });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    if (error instanceof Error && "code" in error && error.code === 11000) {
      return NextResponse.json({ success: false, message: "Email already exists" }, { status: 409 });
    }
    console.error("PUT Supplier Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// DELETE: Delete a supplier
// ==========================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    requireRole(req, ["admin"]);

    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) {
      return NextResponse.json({ success: false, message: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Supplier deleted" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("DELETE Supplier Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}