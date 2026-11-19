import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { requireRole, AuthError } from "@/lib/auth";

// ==========================================
// GET: Fetch all products
// ==========================================
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Admin, Inventory aur Management dekh sakte hain
    requireRole(req, ["admin", "inventory", "management"]);

    const products = await Product.find({}).sort({ createdAt: -1 });

    // Low stock count nikaalo
    const lowStockCount = products.filter(
      (p) => p.stockQuantity <= p.lowStockThreshold
    ).length;

    return NextResponse.json({
      success: true,
      count: products.length,
      lowStockCount,
      products,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("GET Products Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// POST: Create a new product
// ==========================================
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Sirf Admin aur Inventory naya product add kar sakte hain
    requireRole(req, ["admin", "inventory"]);

    const body = await req.json();
    const {
      name,
      sku,
      category,
      price,
      costPrice,
      stockQuantity,
      lowStockThreshold,
      description,
    } = body;

    // Basic Validation
    if (!name || !sku || !category || price === undefined || costPrice === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });

    if (existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product with this SKU already exists" },
        { status: 409 }
      );
    }

    // Create Product
    const product = await Product.create({
      name,
      sku: sku.toUpperCase(),
      category,
      price,
      costPrice,
      stockQuantity: stockQuantity || 0,
      lowStockThreshold: lowStockThreshold || 10,
      description,
    });

    return NextResponse.json(
      {
        success: true,
        message: "✅ Product added successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    // Handle unique index error (E11000) for SKU
    if (error instanceof Error && "code" in error && error.code === 11000) {
       return NextResponse.json(
        { success: false, message: "Product with this SKU already exists" },
        { status: 409 }
      );
    }
    console.error("POST Product Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}