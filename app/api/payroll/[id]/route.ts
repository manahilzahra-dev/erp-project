import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payroll from "@/lib/models/Payroll";
import { requireRole, AuthError } from "@/lib/auth";

// ==========================================
// PUT: Update Payroll Status (e.g., Pending to Paid)
// ==========================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Sirf Admin aur Finance status update kar sakte hain (HR salary generate karta hai, payment finance karta hai)
    requireRole(req, ["admin", "finance"]);

    const body = await req.json();
    
    // Hum sirf status update allow karenge, salary ke numbers change nahi hone denge
    const payroll = await Payroll.findByIdAndUpdate(
      id,
      { $set: { status: body.status } },
      { new: true, runValidators: true }
    );

    if (!payroll) {
      return NextResponse.json({ success: false, message: "Payroll record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Payroll status updated", payroll });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("PUT Payroll Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// DELETE: Delete a payroll record
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

    const payroll = await Payroll.findByIdAndDelete(id);

    if (!payroll) {
      return NextResponse.json({ success: false, message: "Payroll record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Payroll record deleted" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("DELETE Payroll Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}