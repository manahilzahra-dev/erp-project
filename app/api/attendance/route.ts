import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Attendance from "@/lib/models/Attendance";
import { requireRole, AuthError } from "@/lib/auth";
import Employee from "@/lib/models/Employee";
void Employee;
// ==========================================
// GET: Fetch all attendance records
// ==========================================
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Sirf Admin, HR aur Management dekh sakte hain
    requireRole(req, ["admin", "hr", "management"]);

    // .populate() Employee model se firstName aur lastName utha kar layega
    const records = await Attendance.find({})
      .populate("employeeId", "firstName lastName employeeId designation")
      .sort({ date: -1 }); // Latest date pehle

    return NextResponse.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("GET Attendance Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// POST: Mark Attendance
// ==========================================
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Sirf Admin aur HR mark kar sakte hain
    requireRole(req, ["admin", "hr"]);

    const body = await req.json();
    const { employeeId, date, status, checkInTime, checkOutTime, notes } = body;

    if (!employeeId || !date) {
      return NextResponse.json(
        { success: false, message: "Employee and Date are required" },
        { status: 400 }
      );
    }

    // Check if already marked for this date
    // Hum date ko start of day (00:00:00) par set karte hain taake time ka masla na ho
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const existingRecord = await Attendance.findOne({
      employeeId,
      date: startOfDay,
    });

    if (existingRecord) {
      return NextResponse.json(
        { success: false, message: "Attendance already marked for this employee on this date" },
        { status: 409 }
      );
    }

    // Create Record
    const record = await Attendance.create({
      employeeId,
      date: startOfDay,
      status: status || "present",
      checkInTime,
      checkOutTime,
      notes,
    });

    return NextResponse.json(
      { success: true, message: "✅ Attendance marked successfully", record },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    // Handle unique index error (E11000)
    if (error instanceof Error && "code" in error && error.code === 11000) {
       return NextResponse.json(
        { success: false, message: "Attendance already marked for this date" },
        { status: 409 }
      );
    }
    console.error("POST Attendance Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}