import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

function generateTemporaryPassword() {
  const randomPart = crypto.randomBytes(6).toString("base64url");

  return `CI-${randomPart}-9`;
}

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

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
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

    const temporaryPassword = generateTemporaryPassword();

    const passwordHash = await bcrypt.hash(
      temporaryPassword,
      12
    );

    await db.orm.public.User
      .where((user) => user.id.eq(userId))
      .update({
        passwordHash,
      } as any);

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
      temporaryPassword,
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