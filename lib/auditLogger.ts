import AuditLog from "@/lib/models/AuditLog";
import Notification from "@/lib/models/Notification";
import { connectDB } from "@/lib/mongodb";

export async function logAction(
  userId: string,
  action: "CREATE" | "UPDATE" | "DELETE",
  module: string,
  details: string
) {
  try {
    await connectDB();
    
    // 1. Audit Log save karo
    await AuditLog.create({
      user: userId,
      action,
      module,
      details,
    });

    // 2. ✅ Notification bhi banao (sirf Create/Update ke liye)
    if (action === "CREATE" || action === "UPDATE") {
      await Notification.create({
        recipient: userId, // Filhal khud user ko notification ja rahi hai
        title: `${module} ${action === "CREATE" ? "Added" : "Updated"}`,
        message: details,
        type: action === "CREATE" ? "success" : "info",
      });
    }
  } catch (error) {
    console.error("Audit Log Error:", error);
  }
}