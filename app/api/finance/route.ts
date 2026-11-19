import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import Expense from "@/lib/models/Expense";
import { requireRole, AuthError } from "@/lib/auth";

// ==========================================
// GET: Fetch Finance Data (Transactions, Expenses, Profit)
// ==========================================
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "finance", "management"]);

    // 1. Saare transactions (income + expense) laao
    const transactions = await Transaction.find({}).sort({ date: -1 });

    // 2. Saare detailed expenses laao
    const expenses = await Expense.find({}).sort({ date: -1 });

    // 3. Profit/Loss Calculate karo
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalIncome - totalExpense;

    return NextResponse.json({
      success: true,
      transactions,
      expenses,
      summary: {
        totalIncome,
        totalExpense,
        netProfit,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("GET Finance Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// POST: Add Expense or Income
// ==========================================
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "finance"]);

    const body = await req.json();
    const { type } = body; // "expense" ya "income"

    if (type === "expense") {
      // 1. Expense Model mein save karo
      const expense = await Expense.create({
        title: body.title,
        category: body.category,
        amount: body.amount,
        notes: body.notes,
      });

      // 2. Transaction mein bhi record karo (double-entry jaisa)
      await Transaction.create({
        type: "expense",
        amount: body.amount,
        description: `Expense: ${body.title}`,
      });

      return NextResponse.json({ success: true, message: "✅ Expense recorded", expense }, { status: 201 });
    } 
    
    if (type === "income") {
      // 1. Transaction mein income record karo
      const transaction = await Transaction.create({
        type: "income",
        amount: body.amount,
        description: body.description || "Manual Income",
        reference: body.reference,
      });

      return NextResponse.json({ success: true, message: "✅ Income recorded", transaction }, { status: 201 });
    }

    return NextResponse.json({ success: false, message: "Invalid transaction type" }, { status: 400 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("POST Finance Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}