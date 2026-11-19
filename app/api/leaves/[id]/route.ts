import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Leave from "@/lib/models/Leave";
import Attendance from "@/lib/models/Attendance";
import { requireRole, AuthError } from "@/lib/auth";
import { logAction } from "@/lib/auditLogger"; // <-- NAYA IMPORT

// ==========================================
// PUT: Update Leave Status (Approve/Reject)
// ==========================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const authUser = requireRole(req, ["admin", "hr"]); // User ID save karo

    const body = await req.json();
    const { status } = body; // "approved" ya "rejected"

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }

    const leave = await Leave.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!leave) {
      return NextResponse.json({ success: false, message: "Leave not found" }, { status: 404 });
    }

    // ✅ Audit Log
    await logAction(
      authUser.id,
      "UPDATE",
      "Leave",
      `Leave ${status} for employee ID: ${leave.employeeId}`
    );

    // ✅ MAGIC LOGIC: Agar leave approve hui hai, toh Attendance auto-mark karo
    if (status === "approved") {
      const currentDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);

      while (currentDate <= endDate) {
        const startOfDay = new Date(currentDate);
        startOfDay.setHours(0, 0, 0, 0);

        const existing = await Attendance.findOne({
          employeeId: leave.employeeId,
          date: startOfDay,
        });

        if (!existing) {
          await Attendance.create({
            employeeId: leave.employeeId,
            date: startOfDay,
            status: "leave",
            notes: `Approved ${leave.leaveType} leave`,
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return NextResponse.json({ success: true, message: `Leave ${status}`, leave });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("PUT Leave Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// DELETE: Delete Leave
// ==========================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    requireRole(req, ["admin"]);

    const leave = await Leave.findByIdAndDelete(id);
    if (!leave) {
      return NextResponse.json({ success: false, message: "Leave not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Leave deleted" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("DELETE Leave Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}