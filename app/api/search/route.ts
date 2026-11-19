import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/lib/models/Employee";
import Product from "@/lib/models/Product";
import Customer from "@/lib/models/Customer";
import Invoice from "@/lib/models/Invoice";
import { requireAuth, AuthError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireAuth(req);

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, results: [] });
    }

    const regex = new RegExp(query, "i"); // Case-insensitive search

    // Har module mein search karo
    const [employees, products, customers, invoices] = await Promise.all([
      Employee.find({
        $or: [{ firstName: regex }, { lastName: regex }, { email: regex }, { employeeId: regex }],
      }).limit(5).select("firstName lastName employeeId email"),
      
      Product.find({
        $or: [{ name: regex }, { sku: regex }],
      }).limit(5).select("name sku stockQuantity"),
      
      Customer.find({
        $or: [{ name: regex }, { email: regex }, { company: regex }],
      }).limit(5).select("name email company"),
      
      Invoice.find({
        invoiceNumber: regex,
      }).limit(5).select("invoiceNumber grandTotal status"),
    ]);

    const results = [
      ...employees.map((e) => ({
        type: "employee",
        id: e._id,
        title: `${e.firstName} ${e.lastName}`,
        subtitle: `${e.employeeId} · ${e.email}`,
        link: "/dashboard/employees",
      })),
      ...products.map((p) => ({
        type: "product",
        id: p._id,
        title: p.name,
        subtitle: `${p.sku} · Stock: ${p.stockQuantity}`,
        link: "/dashboard/inventory",
      })),
      ...customers.map((c) => ({
        type: "customer",
        id: c._id,
        title: c.name,
        subtitle: `${c.email} · ${c.company || "Individual"}`,
        link: "/dashboard/customers",
      })),
      ...invoices.map((i) => ({
        type: "invoice",
        id: i._id,
        title: `Invoice ${i.invoiceNumber}`,
        subtitle: `Rs ${i.grandTotal} · ${i.status}`,
        link: "/dashboard/sales",
      })),
    ];

    return NextResponse.json({ success: true, results });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Search Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}