import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const endpoint = body.endpoint;
    const p256dh = body.keys?.p256dh;
    const auth = body.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { success: false, error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    const existing =
      await db.orm.public.AdminPushSubscription
        .where((item) => item.endpoint.eq(endpoint))
        .first();

    if (existing) {
      await db.orm.public.AdminPushSubscription
        .where((item) => item.endpoint.eq(endpoint))
        .update({
          adminId: admin.id,
          p256dh,
          auth,
        } as any);
    } else {
      await db.orm.public.AdminPushSubscription.create({
        adminId: admin.id,
        endpoint,
        p256dh,
        auth,
      } as any);
    }

    return NextResponse.json({
      success: true,
      message: "Notifications enabled successfully",
    });
  } catch (error) {
    console.error("Push subscription error:", error);

    return NextResponse.json(
      { success: false, error: "Could not save subscription" },
      { status: 500 }
    );
  }
}