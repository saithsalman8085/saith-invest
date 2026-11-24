
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isDisposableEmail } from "disposable-email-domains-js";
import { db } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function generatePublicUserId() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const BLOCKED_EMAIL_DOMAINS = new Set(["caps7.com"]);

function isBlockedEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase().trim();

  if (!domain) return false;
  if (BLOCKED_EMAIL_DOMAINS.has(domain)) return true;

  return isDisposableEmail(email);
}

async function notifyReferralAncestors(
  referredById: string | null,
  newMemberPublicId: string
) {
  if (!referredById) return;

  const levels = [
    { level: 1, label: "Level 1" },
    { level: 2, label: "Level 2" },
    { level: 3, label: "Level 3" },
  ];

  let currentReferrerId: string | null = referredById;

  for (const item of levels) {
    if (!currentReferrerId) break;

    try {
      const referrer =
        await db.orm.public.User
          .where((user) =>
            user.id.eq(currentReferrerId!)
          )
          .first();

      if (!referrer) break;

      await db.orm.public.Notification.create({
        userId: referrer.id,
        title: "New Referral Joined",
        message: `A new member with User ID ${newMemberPublicId} has joined your referral network at ${item.label}.`,
        type: "REFERRAL_JOINED",
        isRead: false,
      } as any);

      currentReferrerId =
        referrer.referredById || null;
    } catch (error) {
      console.error(
        `REFERRAL_LEVEL_${item.level}_NOTIFICATION_ERROR:`,
        error
      );
      break;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const fullName = String(body.fullName || "").trim();
    const contact = String(body.contact || "").trim();
    const password = String(body.password || "");
    const referralCode = String(body.referralCode || "")
      .trim()
      .toUpperCase();

    if (!fullName || !contact || !password) {
      return NextResponse.json(
        { error: "All required fields must be filled." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const isEmail = contact.includes("@");
    const email = isEmail ? contact.toLowerCase() : null;
    const phone = isEmail ? null : contact;

    if (email && isBlockedEmail(email)) {
      return NextResponse.json(
        {
          error:
            "Temporary or disposable email addresses are not allowed. Please use a permanent email address.",
        },
        { status: 400 }
      );
    }

    if (email) {
      const existingEmail = await db.orm.public.User
        .where((user) => user.email.eq(email))
        .first();

      if (existingEmail) {
        return NextResponse.json(
          { error: "This email is already registered." },
          { status: 409 }
        );
      }
    }

    if (phone) {
      const existingPhone = await db.orm.public.User
        .where((user) => user.phone.eq(phone))
        .first();

      if (existingPhone) {
        return NextResponse.json(
          { error: "This phone number is already registered." },
          { status: 409 }
        );
      }
    }

    let referredById: string | null = null;

    if (referralCode) {
      const referrer = await db.orm.public.User
        .where((user) => user.referralCode.eq(referralCode))
        .first();

      if (!referrer) {
        return NextResponse.json(
          { error: "Invalid referral code." },
          { status: 400 }
        );
      }

      referredById = referrer.id;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let newReferralCode = generateReferralCode();

    while (
      await db.orm.public.User
        .where((user) => user.referralCode.eq(newReferralCode))
        .first()
    ) {
      newReferralCode = generateReferralCode();
    }

    let publicUserId = generatePublicUserId();

    while (
      await db.orm.public.User
        .where((user) => user.publicUserId.eq(publicUserId))
        .first()
    ) {
      publicUserId = generatePublicUserId();
    }

    const user = await db.orm.public.User.create({
      fullName,
      email,
      phone,
      passwordHash,
      publicUserId,
      referralCode: newReferralCode,
      referredById,
      status: "ACTIVE",
      role: "USER",
    });

    // One-time $0.40 welcome bonus.
    const existingBonus = await db.orm.public.Transaction
      .where((transaction) =>
        transaction.referenceId.eq(`WELCOME_BONUS:${user.id}`)
      )
      .first();

    if (!existingBonus) {
      await db.orm.public.Transaction.create({
        userId: user.id,
        type: "ACTIVE_USER_REWARD",
        status: "COMPLETED",
        amountUSD: "0.40",
        balanceBefore: "0.00",
        balanceAfter: "0.40",
        referenceId: `WELCOME_BONUS:${user.id}`,
        description: "Welcome bonus",
      } as any);
    }

    // Notify the user's Level 1, Level 2 and Level 3 referrers.
    await notifyReferralAncestors(
      referredById,
      String(user.publicUserId)
    );

    // Automatically create login session.
    const sessionToken = await createSession(
      user.id,
      Number(user.sessionVersion ?? 0)
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        userId: user.id,
        publicUserId: user.publicUserId,
      },
      { status: 201 }
    );

    response.cookies.set("claudeinvest_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("REGISTER_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create account.",
      },
      { status: 500 }
    );
  }
}
