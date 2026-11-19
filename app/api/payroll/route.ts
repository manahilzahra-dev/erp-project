import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payroll from "@/lib/models/Payroll";
import Attendance from "@/lib/models/Attendance";
import Employee from "@/lib/models/Employee";
import { requireRole, AuthError } from "@/lib/auth";

// ==========================================
// GET: Fetch all payroll records
// ==========================================
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "hr", "finance", "management"]);

    const records = await Payroll.find({})
      .populate("employeeId", "firstName lastName employeeId designation")
      .sort({ month: -1 });

    return NextResponse.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("GET Payroll Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// POST: Generate Payroll
// ==========================================
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "hr"]);

    const body = await req.json();
    const { employeeId, month } = body; // month format: "2026-11"

    if (!employeeId || !month) {
      return NextResponse.json(
        { success: false, message: "Employee and Month are required" },
        { status: 400 }
      );
    }

    // 1. Employee ka data laao
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }

    // 2. Check karo ke is mahine ki payslip pehle se to nahi bani
    const existingPayroll = await Payroll.findOne({ employeeId, month });
    if (existingPayroll) {
      return NextResponse.json(
        { success: false, message: "Payroll already generated for this month" },
        { status: 409 }
      );
    }

    // 3. Us mahine ki Attendance nikaalo
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const attendanceRecords = await Attendance.find({
      employeeId,
      date: { $gte: startDate, $lt: endDate },
    });

    // 4. Calculation Logic (Realistic Approach)
    let presentDays = 0;
    let absentDays = 0;

    attendanceRecords.forEach((record) => {
      if (record.status === "present") presentDays++;
      else if (record.status === "half-day") presentDays += 0.5;
      else if (record.status === "absent") absentDays++;
    });

    const totalWorkingDays = 30;
    
    // ✅ NAYA LOGIC: Sirf un dino ki salary kato jinme employee absent hai.
    // Unmarked days ko hum "Paid" maanenge (Real world mein HR manually mark karta hai).
    const dailyRate = employee.salary / totalWorkingDays;
    const deductions = Math.round(dailyRate * absentDays);
    const netSalary = Math.round(employee.salary - deductions);

    // 5. Payslip save karo
    const payroll = await Payroll.create({
      employeeId,
      month,
      basicSalary: employee.salary,
      totalWorkingDays,
      presentDays,
      absentDays, // ✅ Sirf actual absent days
      deductions,
      netSalary,
      status: "pending",
    });

    return NextResponse.json(
      { success: true, message: "✅ Payroll generated successfully", payroll },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    if (error instanceof Error && "code" in error && error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Payroll already generated for this month" },
        { status: 409 }
      );
    }
    console.error("POST Payroll Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}