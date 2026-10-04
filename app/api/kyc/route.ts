
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const profile = await db.orm.public.WithdrawalProfile
      .where((profile) => profile.userId.eq(userId))
      .first();

    if (!profile) {
      return NextResponse.json({
        success: true,
        kyc: null,
      });
    }

    return NextResponse.json({
      success: true,
      kyc: {
        cnicNumber: profile.cnicNumber,
        easypaisaNumber: profile.easypaisaNumber,
        accountName: profile.accountName,
        isLocked: profile.isLocked,
      },
    });
  } catch (error) {
    console.error("KYC_GET_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load KYC details." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const cnicNumber = String(body.cnicNumber || "").trim();
    const easypaisaNumber = String(body.easypaisaNumber || "").trim();
    const accountName = String(body.accountName || "").trim();

    if (!cnicNumber || !easypaisaNumber || !accountName) {
      return NextResponse.json(
        { error: "All KYC fields are required." },
        { status: 400 }
      );
    }

    const existingProfile = await db.orm.public.WithdrawalProfile
      .where((profile) => profile.userId.eq(userId))
      .first();

    if (existingProfile?.isLocked) {
      return NextResponse.json(
        {
          error:
            "Your withdrawal details are locked. Contact the administrator to make changes.",
        },
        { status: 409 }
      );
    }

    if (existingProfile) {
      return NextResponse.json(
        {
          error:
            "Withdrawal profile already exists and cannot be replaced.",
        },
        { status: 409 }
      );
    }

    const profile = await db.orm.public.WithdrawalProfile.create({
      userId,
      cnicNumber,
      easypaisaNumber,
      accountName,
      isLocked: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "KYC details submitted successfully.",
        kyc: {
          cnicNumber: profile.cnicNumber,
          easypaisaNumber: profile.easypaisaNumber,
          accountName: profile.accountName,
          isLocked: profile.isLocked,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("KYC_POST_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to save KYC details." },
      { status: 500 }
    );
  }
}