
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const contact = String(body.contact || "").trim();
    const password = String(body.password || "");

    if (!contact || !password) {
      return NextResponse.json(
        { error: "Email/phone and password are required." },
        { status: 400 }
      );
    }

    const isEmail = contact.includes("@");

    const email = isEmail ? contact.toLowerCase() : null;
    const phone = isEmail ? null : contact;

    const user = email
      ? await db.orm.public.User
          .where((user) => user.email.eq(email))
          .first()
      : await db.orm.public.User
          .where((user) => user.phone.eq(phone!))
          .first();

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email/phone or password." },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Your account is not active." },
        { status: 403 }
      );
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email/phone or password." },
        { status: 401 }
      );
    }

    const sessionToken = await createSession(user.id);

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        referralCode: user.referralCode,
        role: user.role,
      },
    });

    response.cookies.set("claudeinvest_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to login.",
      },
      { status: 500 }
    );
  }
}