import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Leave from "@/lib/models/Leave";
import Attendance from "@/lib/models/Attendance";
import Employee from "@/lib/models/Employee"; // populate ke liye zaroori
import { requireRole, AuthError } from "@/lib/auth";

// ==========================================
// GET: Fetch all leaves
// ==========================================
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "hr", "management"]);

    const leaves = await Leave.find({})
      .populate("employeeId", "firstName lastName employeeId designation")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("GET Leave Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// POST: Apply for Leave
// ==========================================
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "hr"]);

    const body = await req.json();
    const { employeeId, leaveType, startDate, endDate, reason } = body;

    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return NextResponse.json(
        { success: false, message: "End date cannot be before start date" },
        { status: 400 }
      );
    }

    // Calculate total days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 taake inclusive ho

    const leave = await Leave.create({
      employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      totalDays,
      status: "pending",
    });

    return NextResponse.json(
      { success: true, message: "✅ Leave applied successfully", leave },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("POST Leave Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}