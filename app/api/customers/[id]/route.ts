import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";
import { requireRole, AuthError } from "@/lib/auth";

// ==========================================
// PUT: Update a customer
// ==========================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    requireRole(req, ["admin", "sales"]);

    const body = await req.json();
    if (body.email) body.email = body.email.toLowerCase();

    const customer = await Customer.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Customer updated", customer });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    if (error instanceof Error && "code" in error && error.code === 11000) {
      return NextResponse.json({ success: false, message: "Email already exists" }, { status: 409 });
    }
    console.error("PUT Customer Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// DELETE: Delete a customer
// ==========================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    requireRole(req, ["admin"]);

    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Customer deleted" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("DELETE Customer Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}