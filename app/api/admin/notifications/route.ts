
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const title = String(body.title || "").trim();
    const message = String(body.message || "").trim();
    const targetType = String(body.targetType || "").trim().toUpperCase();
    const publicUserId = String(body.publicUserId || "").trim();

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required." },
        { status: 400 }
      );
    }

    if (title.length > 150 || message.length > 5000) {
      return NextResponse.json(
        { error: "Title or message is too long." },
        { status: 400 }
      );
    }

    if (!["ALL", "SINGLE"].includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid notification target." },
        { status: 400 }
      );
    }

    let recipients;

    if (targetType === "SINGLE") {
      if (!/^\d{6}$/.test(publicUserId)) {
        return NextResponse.json(
          { error: "Enter a valid 6-digit User ID." },
          { status: 400 }
        );
      }

      const user = await db.orm.public.User
        .where((u) => u.publicUserId.eq(publicUserId))
        .first();

      if (!user || String(user.role) !== "USER") {
        return NextResponse.json(
          { error: "User not found." },
          { status: 404 }
        );
      }

      recipients = [user];
    } else {
      const users = await db.orm.public.User.all();
      recipients = users.filter(
        (user) => String(user.role) === "USER"
      );
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No users found." },
        { status: 404 }
      );
    }

    for (const user of recipients) {
      await db.orm.public.Notification.create({
        userId: user.id,
        title,
        message,
        type: "ADMIN",
        isRead: false,
      } as any);
    }

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully.",
      sentCount: recipients.length,
    });
  } catch (error) {
  console.error("ADMIN_NOTIFICATION_ERROR:", error);

  console.error(
    "ERROR DETAILS:",
    error instanceof Error ? error.stack : String(error)
  );

  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Unable to send notification." },
    { status: 500 }
  );
}
}