import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/lib/models/Task";
import Project from "@/lib/models/Project";
import Employee from "@/lib/models/Employee";
import { requireRole, AuthError } from "@/lib/auth";

void Project;
void Employee;

// GET: Fetch all tasks (optionally filter by projectId)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "management"]);

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    const query = projectId ? { projectId } : {};

    const tasks = await Task.find(query)
      .populate("assignedTo", "firstName lastName employeeId")
      .populate("projectId", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("GET Tasks Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// POST: Create a new task
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin", "management"]);

    const body = await req.json();
    const { title, description, projectId, assignedTo, priority, dueDate, status } = body;

    if (!title || !projectId || !assignedTo || !dueDate) {
      return NextResponse.json(
        { success: false, message: "Title, Project, Assignee, and Due Date are required" },
        { status: 400 }
      );
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      priority: priority || "medium",
      status: status || "pending", // ✅ Ab form se status lega
      dueDate,
    });

    return NextResponse.json(
      { success: true, message: "✅ Task created successfully", task },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("POST Task Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}