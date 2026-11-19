import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/lib/models/Notification";
import { requireAuth, AuthError } from "@/lib/auth";

// ==========================================
// GET: Fetch notifications for current user
// ==========================================
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authUser = requireAuth(req);

    const notifications = await Notification.find({ recipient: authUser.id })
      .sort({ createdAt: -1 })
      .limit(20); // Sirf last 20

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("GET Notifications Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ==========================================
// PUT: Mark notifications as read
// ==========================================
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const authUser = requireAuth(req);

    // Saari notifications ko read mark kar do
    await Notification.updateMany(
      { recipient: authUser.id, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("PUT Notifications Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}