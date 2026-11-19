import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AuditLog from "@/lib/models/AuditLog";
import User from "@/lib/models/User"; // populate ke liye
import { requireRole, AuthError } from "@/lib/auth";
void User;
// GET: Fetch recent audit logs (Admin only)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin"]);

    const logs = await AuditLog.find({})
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(100); // Last 100 logs

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("GET Audit Logs Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}