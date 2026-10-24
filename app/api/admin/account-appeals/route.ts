
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const appeals = await db.orm.public.AccountAppeal.all();

    const users = await db.orm.public.User.all();

    const result = appeals.map((appeal) => {
      const user = users.find((item) => item.id === appeal.userId);

      return {
        ...appeal,
        user: user
          ? {
              id: user.id,
              publicUserId: user.publicUserId,
              fullName: user.fullName,
              email: user.email,
              phone: user.phone,
              status: user.status,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      appeals: result,
    });
  } catch (error) {
    console.error("ADMIN_APPEALS_GET_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load account appeals." },
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

    const appealId = String(body.appealId || "").trim();
    const decision = String(body.decision || "").trim().toUpperCase();
    const adminNote = String(body.adminNote || "").trim();

    if (!appealId || !["APPROVED", "REJECTED"].includes(decision)) {
      return NextResponse.json(
        { error: "A valid appeal ID and decision are required." },
        { status: 400 }
      );
    }

    const appeal = await db.orm.public.AccountAppeal
      .where((item) => item.id.eq(appealId))
      .first();

    if (!appeal) {
      return NextResponse.json(
        { error: "Appeal not found." },
        { status: 404 }
      );
    }

    if (String(appeal.status) !== "PENDING") {
      return NextResponse.json(
        { error: "This appeal has already been reviewed." },
        { status: 409 }
      );
    }

    const user = await db.orm.public.User
      .where((item) => item.id.eq(appeal.userId))
      .first();

    if (!user) {
      return NextResponse.json(
        { error: "Appeal user's account was not found." },
        { status: 404 }
      );
    }

    if (decision === "APPROVED" && String(user.status) !== "SUSPENDED") {
      return NextResponse.json(
        { error: "Only suspended accounts can be reactivated through an appeal." },
        { status: 400 }
      );
    }

    // Update the appeal review status.
    await db.orm.public.AccountAppeal
      .where((item) => item.id.eq(appealId))
      .update({
        status: decision,
        adminNote: adminNote || null,
        reviewedById: admin.id,
        reviewedAt: new Date().toISOString().slice(0, 23),
      } as any);

    // Reactivate the user only when the appeal is approved.
    if (decision === "APPROVED") {
      await db.orm.public.User
        .where((item) => item.id.eq(user.id))
        .update({
          status: "ACTIVE",
        } as any);
    }

    await db.orm.public.AuditLog.create({
      action: decision === "APPROVED" ? "USER_ACTIVATE" : "USER_SUSPEND",
      adminId: admin.id,
      targetUserId: user.id,
      description:
        decision === "APPROVED"
          ? "Account appeal approved and user reactivated."
          : "Account appeal rejected by administrator.",
      metadata: {
        appealId,
        decision,
        adminNote,
        previousUserStatus: String(user.status),
      },
    } as any);

    return NextResponse.json({
      success: true,
      message:
        decision === "APPROVED"
          ? "Appeal approved. User account reactivated."
          : "Appeal rejected.",
    });
  } catch (error) {
    console.error("ADMIN_APPEALS_PATCH_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to review the appeal." },
      { status: 500 }
    );
  }
}
