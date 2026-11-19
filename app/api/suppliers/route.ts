import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Supplier from "@/lib/models/Supplier";
import { requireRole, AuthError } from "@/lib/auth";

// ==========================================
// GET: Fetch all suppliers
// ==========================================
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "inventory", "management"]);

    const suppliers = await Supplier.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: suppliers.length,
      suppliers,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("GET Suppliers Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// POST: Create a new supplier
// ==========================================
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "inventory"]);

    const body = await req.json();
    const { name, company, email, phone, address } = body;

    if (!name || !company || !email || !phone || !address) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const existingSupplier = await Supplier.findOne({ email: email.toLowerCase() });
    if (existingSupplier) {
      return NextResponse.json(
        { success: false, message: "Supplier with this email already exists" },
        { status: 409 }
      );
    }

    const supplier = await Supplier.create({
      name,
      company,
      email: email.toLowerCase(),
      phone,
      address,
    });

    return NextResponse.json(
      { success: true, message: "✅ Supplier added successfully", supplier },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    if (error instanceof Error && "code" in error && error.code === 11000) {
      return NextResponse.json({ success: false, message: "Supplier with this email already exists" }, { status: 409 });
    }
    console.error("POST Supplier Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}