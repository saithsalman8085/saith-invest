
import { NextResponse } from "next/server";
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

    const user = await db.orm.public.User
      .where((user) => user.id.eq(userId))
      .first();

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        publicUserId: user.publicUserId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        referralCode: user.referralCode,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("PROFILE_GET_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load profile." },
      { status: 500 }
    );
  }
}