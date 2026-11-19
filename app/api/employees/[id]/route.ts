import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/lib/models/Employee";
import { requireRole, AuthError } from "@/lib/auth";
import { logAction } from "@/lib/auditLogger";

// ==========================================
// PUT: Update an employee
// ==========================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Next.js 15+ fix
    const { id } = await params;

    // Sirf Admin aur HR update kar sakte hain
    const authUser = requireRole(req, ["admin", "hr"]);

    const body = await req.json();
    
    const employee = await Employee.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }

    // ✅ Audit Log
    await logAction(
      authUser.id,
      "UPDATE",
      "Employee",
      `Updated employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`
    );

    return NextResponse.json({ success: true, message: "Employee updated", employee });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("PUT Employee Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// DELETE: Delete an employee
// ==========================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Next.js 15+ fix
    const { id } = await params;

    // Sirf Admin delete kar sakta hai
    const authUser = requireRole(req, ["admin"]);

    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }

    // ✅ Audit Log
    await logAction(
      authUser.id,
      "DELETE",
      "Employee",
      `Deleted employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`
    );

    return NextResponse.json({ success: true, message: "Employee deleted" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("DELETE Employee Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}