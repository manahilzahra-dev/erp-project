import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";
import { requireRole, AuthError } from "@/lib/auth";

// ==========================================
// GET: Fetch all customers
// ==========================================
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "sales", "management"]);

    const customers = await Customer.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("GET Customers Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// POST: Create a new customer
// ==========================================
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "sales"]);

    const body = await req.json();
    const { name, email, phone, company, address, status } = body;

    if (!name || !email || !phone || !address) {
      return NextResponse.json(
        { success: false, message: "Name, Email, Phone, and Address are required" },
        { status: 400 }
      );
    }

    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return NextResponse.json(
        { success: false, message: "Customer with this email already exists" },
        { status: 409 }
      );
    }

    const customer = await Customer.create({
      name,
      email: email.toLowerCase(),
      phone,
      company,
      address,
      status: status || "active",
    });

    return NextResponse.json(
      { success: true, message: "✅ Customer added successfully", customer },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    if (error instanceof Error && "code" in error && error.code === 11000) {
      return NextResponse.json({ success: false, message: "Customer with this email already exists" }, { status: 409 });
    }
    console.error("POST Customer Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}