import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

async function getUser() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const user = await db.orm.public.User
    .where((item) => item.id.eq(userId))
    .first();

  return user;
}

export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const profile = await db.orm.public.WithdrawalProfile
      .where((item) => item.userId.eq(user.id))
      .first();

    if (!profile) {
      return NextResponse.json({
        success: true,
        profile: null,
      });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        cnicNumber: profile.cnicNumber,
        easypaisaNumber: profile.easypaisaNumber,
        accountName: profile.accountName,
        isLocked: Boolean(profile.isLocked),
      },
    });
  } catch (error) {
    console.error("KYC_PROFILE_GET_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load withdrawal profile." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const cnicNumber = String(body.cnicNumber || "").trim();
    const easypaisaNumber = String(
      body.easypaisaNumber || ""
    ).trim();
    const accountName = String(body.accountName || "").trim();

    if (!cnicNumber || !easypaisaNumber || !accountName) {
      return NextResponse.json(
        {
          error:
            "CNIC, Easypaisa number and account name are required.",
        },
        { status: 400 }
      );
    }

    const existingProfile =
      await db.orm.public.WithdrawalProfile
        .where((item) => item.userId.eq(user.id))
        .first();

    if (existingProfile) {
      if (Boolean(existingProfile.isLocked)) {
        return NextResponse.json(
          {
            error:
              "Your withdrawal details are locked. Contact support to make changes.",
          },
          { status: 400 }
        );
      }

      const updatedProfile =
        await db.orm.public.WithdrawalProfile
          .where((item) => item.userId.eq(user.id))
          .update({
            cnicNumber,
            easypaisaNumber,
            accountName,
            isLocked: true,
          } as any);

      await db.orm.public.AuditLog.create({
        action: "KYC_LOCK",
        targetUserId: user.id,
        description:
          "Withdrawal profile updated and locked by user.",
        metadata: {
          method: "USER_SUBMISSION",
        },
      } as any);

      return NextResponse.json({
        success: true,
        message: "Withdrawal details saved and locked.",
        profile: updatedProfile,
      });
    }

    const profile =
      await db.orm.public.WithdrawalProfile.create({
        userId: user.id,
        cnicNumber,
        easypaisaNumber,
        accountName,
        isLocked: true,
      } as any);

    await db.orm.public.AuditLog.create({
      action: "KYC_LOCK",
      targetUserId: user.id,
      description:
        "Withdrawal profile submitted and locked by user.",
      metadata: {
        method: "USER_SUBMISSION",
      },
    } as any);

    return NextResponse.json({
      success: true,
      message: "Withdrawal details saved and locked.",
      profile,
    });
  } catch (error) {
    console.error("KYC_PROFILE_POST_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save withdrawal profile.",
      },
      { status: 500 }
    );
  }
}
