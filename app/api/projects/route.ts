import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/lib/models/Project";
import Employee from "@/lib/models/Employee"; // populate ke liye
import { requireRole, AuthError } from "@/lib/auth";
void Employee;
// ==========================================
// GET: Fetch all projects
// ==========================================
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "management"]); // Sirf Management dekh sakta hai

    const projects = await Project.find({})
      .populate("managerId", "firstName lastName employeeId")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("GET Projects Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// POST: Create a new project
// ==========================================
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "management"]);

    const body = await req.json();
    const { name, description, startDate, endDate, managerId } = body;

    if (!name || !description || !startDate || !endDate || !managerId) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      managerId,
      status: "planning", // Default
    });

    return NextResponse.json(
      { success: true, message: "✅ Project created successfully", project },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("POST Project Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}