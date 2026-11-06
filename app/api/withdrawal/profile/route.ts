
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

const PAYMENT_METHODS = [
  "JazzCash",
  "Easypaisa",
  "NayaPay",
  "SadaPay",
];

async function getUser() {
  const userId = await getCurrentUserId();

  if (!userId) return null;

  return await db.orm.public.User
    .where((item) => item.id.eq(userId))
    .first();
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

    let isLocked = Boolean(profile.isLocked);

    // Unlock old profiles once so users can enter new payment details.
    if (!profile.paymentMethod && isLocked) {
      await db.orm.public.WithdrawalProfile
        .where((item) => item.userId.eq(user.id))
        .update({
          isLocked: false,
        } as any);

      isLocked = false;
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        paymentMethod: profile.paymentMethod || "",
        accountNumber: profile.accountNumber || "",
        accountName: profile.accountName,
        isLocked,
      },
    });
  } catch (error) {
    console.error("WITHDRAWAL_PROFILE_GET_ERROR:", error);

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

    const paymentMethod = String(
      body.paymentMethod || ""
    ).trim();

    const accountNumber = String(
      body.accountNumber || ""
    ).trim();

    const accountName = String(
      body.accountName || ""
    ).trim();

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Please select a valid payment method." },
        { status: 400 }
      );
    }

    if (!accountNumber || !/^[0-9+\-\s]{7,20}$/.test(accountNumber)) {
      return NextResponse.json(
        { error: "Please enter a valid account/mobile number." },
        { status: 400 }
      );
    }

    if (!accountName || accountName.length < 3) {
      return NextResponse.json(
        { error: "Please enter a valid account holder name." },
        { status: 400 }
      );
    }

    const existingProfile =
      await db.orm.public.WithdrawalProfile
        .where((item) => item.userId.eq(user.id))
        .first();

    if (existingProfile && Boolean(existingProfile.isLocked)) {
      return NextResponse.json(
        {
          error:
            "Your withdrawal details are locked. Contact support to make changes.",
        },
        { status: 400 }
      );
    }

    const profileData = {
      paymentMethod,
      accountNumber,
      accountName,
      isLocked: true,
    };

    if (existingProfile) {
      await db.orm.public.WithdrawalProfile
        .where((item) => item.userId.eq(user.id))
        .update(profileData as any);
    } else {
      await db.orm.public.WithdrawalProfile.create({
        userId: user.id,
        cnicNumber: "",
        easypaisaNumber: "",
        ...profileData,
      } as any);
    }

    const savedProfile =
      await db.orm.public.WithdrawalProfile
        .where((item) => item.userId.eq(user.id))
        .first();

    if (!savedProfile) {
      return NextResponse.json(
        { error: "Unable to load saved withdrawal details." },
        { status: 500 }
      );
    }

    await db.orm.public.AuditLog.create({
      action: "KYC_LOCK",
      targetUserId: user.id,
      description:
        "Withdrawal payment details saved and locked by user.",
      metadata: {
        method: paymentMethod,
      },
    } as any);

    return NextResponse.json({
      success: true,
      message: "Withdrawal details saved and locked.",
      profile: {
        id: savedProfile.id,
        paymentMethod: savedProfile.paymentMethod,
        accountNumber: savedProfile.accountNumber,
        accountName: savedProfile.accountName,
        isLocked: Boolean(savedProfile.isLocked),
      },
    });
  } catch (error) {
    console.error("WITHDRAWAL_PROFILE_POST_ERROR:", error);

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
