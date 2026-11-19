import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/lib/models/Employee";
import Product from "@/lib/models/Product";
import Invoice from "@/lib/models/Invoice";
import Transaction from "@/lib/models/Transaction";
import { requireRole, AuthError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "management"]);

    // 1. Counts
    const totalEmployees = await Employee.countDocuments({ status: "active" });
    const totalProducts = await Product.countDocuments({ status: "active" });
    
    // 2. Financial Data
    const invoices = await Invoice.find({});
    const transactions = await Transaction.find({});

    // 3. Calculate Totals
    const totalSales = invoices.filter(inv => inv.status !== "cancelled").reduce((sum, inv) => sum + inv.grandTotal, 0);
    
    const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    
    // Note: Sales invoice ki income alag hai, transaction income alag hai.
    // Real ERP mein, jab invoice paid hota hai tab transaction income banti hai. 
    // Abhi ke liye hum dono ko combine karke dekh rahe hain.
    // For simplicity, let's just use total sales for income in reports, or sum both.
    // Let's sum both to show total cash flow (Sales + Other Income).
    const totalRevenue = totalSales + totalIncome; 
    const netProfit = totalRevenue - totalExpense;

    // 4. Low Stock Items (for alert)
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] }
    }).select("name sku stockQuantity");

    // 5. Recent Sales (last 5)
    const recentSales = await Invoice.find({ status: "paid" })
      .populate("customerId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalEmployees,
          totalProducts,
          totalSales,
          totalRevenue,
          totalExpense,
          netProfit,
        },
        lowStockProducts,
        recentSales,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("GET Reports Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}