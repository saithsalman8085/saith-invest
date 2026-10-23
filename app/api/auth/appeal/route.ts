
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verify the user's session
    const cookieStore = await cookies();
    const token = cookieStore.get("claudeinvest_session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Please log in to submit an appeal." },
        { status: 401 }
      );
    }

    const userId = await verifySession(token);

    if (!userId) {
      return NextResponse.json(
        { error: "Your session is invalid. Please log in again." },
        { status: 401 }
      );
    }

    // Validate appeal message
    const body = await request.json();
    const message = String(body.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "Please explain why your account should be reactivated." },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Appeal message cannot exceed 2000 characters." },
        { status: 400 }
      );
    }

    // Find the user
    const user = await db.orm.public.User
      .where((item) => item.id.eq(userId))
      .first();

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    if (String(user.status) === "BLOCKED") {
      return NextResponse.json(
        { error: "Your account is blocked. Please contact support." },
        { status: 403 }
      );
    }

    if (String(user.status) !== "SUSPENDED") {
      return NextResponse.json(
        { error: "Appeals are only available for suspended accounts." },
        { status: 400 }
      );
    }

    // Prevent duplicate pending appeals
    const pendingAppeals = await db.orm.public.AccountAppeal
      .where((appeal) => appeal.userId.eq(user.id))
      .all();

    const alreadyPending = pendingAppeals.some(
      (appeal) => String(appeal.status) === "PENDING"
    );

    if (alreadyPending) {
      return NextResponse.json(
        { error: "You already have a pending appeal." },
        { status: 409 }
      );
    }

    // Create appeal
    await db.orm.public.AccountAppeal.create({
      userId: user.id,
      message,
    });

    return NextResponse.json({
      success: true,
      message: "Your appeal has been submitted successfully.",
    });
  } catch (error) {
    console.error("ACCOUNT_APPEAL_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to submit your appeal. Please try again later." },
      { status: 500 }
    );
  }
}
