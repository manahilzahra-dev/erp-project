import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/lib/models/Employee";
import { requireRole, AuthError } from "@/lib/auth";
import { logAction } from "@/lib/auditLogger"; // <-- NAYA IMPORT

// ==========================================
// GET: Fetch all employees
// ==========================================
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "hr", "management"]);

    const employees = await Employee.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("GET Employees Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// POST: Create a new employee
// ==========================================
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const authUser = requireRole(req, ["admin", "hr"]); // User ID save karo

    const body = await req.json();
    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      designation,
      department,
      joiningDate,
      salary,
    } = body;

    // Basic Validation
    if (
      !employeeId ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !designation ||
      !department ||
      !joiningDate ||
      !salary
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if Employee ID or Email already exists
    const existingEmployee = await Employee.findOne({
      $or: [{ email: email.toLowerCase() }, { employeeId }],
    });

    if (existingEmployee) {
      return NextResponse.json(
        { success: false, message: "Employee with this ID or Email already exists" },
        { status: 409 }
      );
    }

    // Create Employee
    const employee = await Employee.create({
      employeeId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      designation,
      department,
      joiningDate,
      salary,
    });

    // ✅ Audit Log
    await logAction(
      authUser.id,
      "CREATE",
      "Employee",
      `Added new employee: ${firstName} ${lastName} (${employeeId})`
    );

    return NextResponse.json(
      {
        success: true,
        message: "✅ Employee added successfully",
        employee,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("POST Employee Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}