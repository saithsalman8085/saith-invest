import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const search =
      request.nextUrl.searchParams
        .get("search")
        ?.trim()
        .toLowerCase() || "";

    const users = await db.orm.public.User.all();

    const results = [];

    for (const user of users) {
      const profile =
        await db.orm.public.WithdrawalProfile
          .where((item) => item.userId.eq(user.id))
          .first();

      if (!profile) {
        continue;
      }

      const matches =
        !search ||
        String(user.fullName || "")
          .toLowerCase()
          .includes(search) ||
        String(user.email || "")
          .toLowerCase()
          .includes(search) ||
        String(user.phone || "")
          .toLowerCase()
          .includes(search) ||
        String(user.publicUserId || "")
          .toLowerCase()
          .includes(search);

      if (!matches) {
        continue;
      }

      results.push({
        userId: user.id,
        publicUserId: user.publicUserId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        cnicNumber: profile.cnicNumber,
        easypaisaNumber: profile.easypaisaNumber,
        accountName: profile.accountName,
        isLocked: Boolean(profile.isLocked),
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      });
    }

    return NextResponse.json({
      success: true,
      profiles: results,
    });
  } catch (error) {
    console.error("ADMIN_KYC_GET_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load KYC profiles." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const action = String(body.action || "")
      .trim()
      .toUpperCase();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    if (action !== "UNLOCK") {
      return NextResponse.json(
        { error: "Invalid KYC action." },
        { status: 400 }
      );
    }

    const targetUser =
      await db.orm.public.User
        .where((user) => user.id.eq(userId))
        .first();

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const profile =
      await db.orm.public.WithdrawalProfile
        .where((item) => item.userId.eq(userId))
        .first();

    if (!profile) {
      return NextResponse.json(
        { error: "Withdrawal profile not found." },
        { status: 404 }
      );
    }

    if (!Boolean(profile.isLocked)) {
      return NextResponse.json(
        {
          error:
            "This KYC profile is already unlocked.",
        },
        { status: 400 }
      );
    }

    const updatedProfile =
      await db.orm.public.WithdrawalProfile
        .where((item) => item.userId.eq(userId))
        .update({
          isLocked: false,
        } as any);

    await db.orm.public.AuditLog.create({
      action: "KYC_UNLOCK",
      adminId: admin.id,
      targetUserId: userId,
      description:
        "Withdrawal KYC profile unlocked by administrator.",
      metadata: {
        method: "ADMIN",
      },
    } as any);

    return NextResponse.json({
      success: true,
      message: "KYC profile unlocked successfully.",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("ADMIN_KYC_PATCH_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update KYC profile.",
      },
      { status: 500 }
    );
  }
}