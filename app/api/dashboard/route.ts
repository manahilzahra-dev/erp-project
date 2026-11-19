import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/lib/models/Employee";
import Product from "@/lib/models/Product";
import Invoice from "@/lib/models/Invoice";
import Task from "@/lib/models/Task";
import { requireAuth, AuthError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireAuth(req); // Koi bhi logged-in user dekh sakta hai

    // Speed Optimization: Promise.all se saare counts ek saath nikaalo
    const [
      totalEmployees,
      totalProducts,
      invoices,
      pendingTasks,
    ] = await Promise.all([
      Employee.countDocuments({ status: "active" }),
      Product.countDocuments({ status: "active" }),
      Invoice.find({ status: { $ne: "cancelled" } }).select("grandTotal"), // Sirf total nikaalne ke liye
      Task.countDocuments({ status: { $ne: "completed" } }),
    ]);

    const totalSales = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalEmployees,
        totalProducts,
        totalSales,
        pendingTasks,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("GET Dashboard Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}