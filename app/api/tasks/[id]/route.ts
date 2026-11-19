import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/lib/models/Task";
import { requireRole, AuthError } from "@/lib/auth";

// ==========================================
// PUT: Update a task
// ==========================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    requireRole(req, ["admin", "management"]);

    const body = await req.json();
    const task = await Task.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Task updated", task });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("PUT Task Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// DELETE: Delete a task
// ==========================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    requireRole(req, ["admin"]);

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Task deleted" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("DELETE Task Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}