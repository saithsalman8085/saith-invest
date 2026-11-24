
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please login first." },
        { status: 401 }
      );
    }

    const allNotifications =
      await db.orm.public.Notification.all();

    const notifications = allNotifications
      .filter((notification) => notification.userId === userId)
      .sort((a, b) =>
        String(b.createdAt).localeCompare(String(a.createdAt))
      );

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.filter(
        (notification) => !notification.isRead
      ).length,
    });
  } catch (error) {
    console.error("USER_NOTIFICATIONS_GET_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load notifications." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please login first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const notificationId = String(
      body.notificationId || ""
    ).trim();

    const allNotifications =
      await db.orm.public.Notification.all();

    const userNotifications = allNotifications.filter(
      (notification) => notification.userId === userId
    );

    if (body.markAllRead === true) {
      const unread = userNotifications.filter(
        (notification) => !notification.isRead
      );

      for (const notification of unread) {
        await db.orm.public.Notification
          .where((item) => item.id.eq(notification.id))
          .update({ isRead: true } as any);
      }

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read.",
      });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required." },
        { status: 400 }
      );
    }

    const notification = userNotifications.find(
      (item) => item.id === notificationId
    );

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found." },
        { status: 404 }
      );
    }

    await db.orm.public.Notification
      .where((item) => item.id.eq(notificationId))
      .update({ isRead: true } as any);

    return NextResponse.json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error) {
    console.error("USER_NOTIFICATIONS_PATCH_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to update notification." },
      { status: 500 }
    );
  }
}
