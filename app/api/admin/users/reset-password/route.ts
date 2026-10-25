
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

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

    const userId = String(body.userId || "").trim();
    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        { error: "Password cannot exceed 128 characters." },
        { status: 400 }
      );
    }

    const targetUser = await db.orm.public.User
      .where((user) => user.id.eq(userId))
      .first();

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    if (String(targetUser.role) === "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Admin passwords cannot be reset from user management.",
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await db.orm.public.User
      .where((user) => user.id.eq(userId))
      .update({ passwordHash } as any);

    await db.orm.public.AuditLog.create({
      action: "PASSWORD_RESET",
      adminId: admin.id,
      targetUserId: userId,
      description: "User password reset by administrator.",
      metadata: {
        method: "ADMIN_RESET",
      },
    } as any);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("ADMIN_PASSWORD_RESET_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to reset password.",
      },
      { status: 500 }
    );
  }
}
