
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isDisposableEmail } from "disposable-email-domains-js";
import { randomInt, randomBytes } from "crypto";
import { db } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const REFERRAL_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const BLOCKED_EMAIL_DOMAINS = new Set([
  "caps7.com",
]);

const COMMON_EMAIL_TYPOS = new Set([
  "gmal.com",
  "gmil.com",
  "gmai.com",
  "gmali.com",
  "gmial.com",
  "gamil.com",
  "gmail.con",
  "gmail.coom",
  "gmail.om",
  "gmail.cm",
  "gmail.comm",
  "gmail.org",
  "gmail.net",
  "hotmal.com",
  "hotmial.com",
  "hotmai.com",
  "hotmil.com",
  "yaho.com",
  "yahooo.com",
  "yahoo.con",
  "yahoo.co",
  "outlok.com",
  "outllok.com",
  "outlook.con",
  "outloo.com",
]);

const WEAK_PASSWORDS = new Set([
  "password",
  "password123",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty123",
  "qwertyui",
  "admin123",
  "welcome123",
  "iloveyou",
  "abc12345",
  "11111111",
  "00000000",
]);

function generateReferralCode() {
  let code = "";

  for (let i = 0; i < 8; i++) {
    code += REFERRAL_CHARSET[
      randomInt(REFERRAL_CHARSET.length)
    ];
  }

  return code;
}

function generatePublicUserId() {
  return String(randomInt(100000, 1000000));
}

function isBlockedEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase().trim();

  if (!domain) return true;

  if (BLOCKED_EMAIL_DOMAINS.has(domain)) {
    return true;
  }

  if (COMMON_EMAIL_TYPOS.has(domain)) {
    return true;
  }

  try {
    return isDisposableEmail(email);
  } catch {
    // Fail closed if disposable-email checking fails.
    return true;
  }
}

function normalizeName(name: string) {
  return name
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function isValidName(name: string) {
  if (name.length < 2 || name.length > 50) {
    return false;
  }

  // Allow letters, numbers, spaces, apostrophes,
  // dots and hyphens.
  if (!/^[\p{L}\p{M}\p{N} .'-]+$/u.test(name)) {
    return false;
  }

  // Must contain at least two actual characters
  // after normalization.
  return normalizeName(name).length >= 2;
}

function isValidEmail(email: string) {
  if (email.length > 254) return false;

  const parts = email.split("@");

  if (parts.length !== 2) return false;

  const local = parts[0];
  const domain = parts[1].toLowerCase();

  if (!local || local.length > 64) return false;

  if (local.startsWith(".") || local.endsWith(".")) {
    return false;
  }

  if (local.includes("..")) {
    return false;
  }

  // Validate domain format.
  if (
    !/^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(
      domain
    )
  ) {
    return false;
  }

  if (COMMON_EMAIL_TYPOS.has(domain)) {
    return false;
  }

  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
    email
  );
}

function isValidPakistaniPhone(phone: string) {
  return /^03\d{9}$/.test(phone);
}

function isValidPassword(password: string) {
  if (password.length < 8) return false;

  // bcrypt has a maximum input size of 72 bytes.
  if (Buffer.byteLength(password, "utf8") > 72) {
    return false;
  }

  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return false;
  }

  // Require at least 3 of these 4 character groups.
  const checks = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];

  return checks.filter(Boolean).length >= 3;
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
    // Reject oversized registration requests.
    const contentLength = request.headers.get("content-length");

    if (
      contentLength &&
      Number(contentLength) > 10_000
    ) {
      return NextResponse.json(
        { error: "Request is too large." },
        { status: 413 }
      );
    }

    let body: any;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request data." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request data." },
        { status: 400 }
      );
    }

    const fullName =
      typeof body.fullName === "string"
        ? body.fullName.trim()
        : "";

    const contact =
      typeof body.contact === "string"
        ? body.contact.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const referralCode =
      typeof body.referralCode === "string"
        ? body.referralCode.trim().toUpperCase()
        : "";

    if (!fullName || !contact || !password) {
      return NextResponse.json(
        { error: "All required fields must be filled." },
        { status: 400 }
      );
    }

    // Validate name.
    if (!isValidName(fullName)) {
      return NextResponse.json(
        {
          error:
            "Name must be 2-50 characters and contain only valid letters.",
        },
        { status: 400 }
      );
    }

    // Validate password.
    if (!isValidPassword(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters, contain at least 3 types of characters (uppercase, lowercase, numbers or symbols), and not be a common password.",
        },
        { status: 400 }
      );
    }

    if (contact.length > 254) {
      return NextResponse.json(
        { error: "Email or phone number is too long." },
        { status: 400 }
      );
    }

    if (referralCode.length > 20) {
      return NextResponse.json(
        { error: "Invalid referral code." },
        { status: 400 }
      );
    }

    const isEmail = contact.includes("@");

    const email = isEmail
      ? contact.toLowerCase()
      : null;

    const phone = isEmail
      ? null
      : contact;

    // Email format validation.
    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Pakistani mobile validation.
    if (phone && !isValidPakistaniPhone(phone)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid Pakistani mobile number (03XXXXXXXXX).",
        },
        { status: 400 }
      );
    }

    // Block disposable and suspicious email domains.
    if (email && isBlockedEmail(email)) {
      return NextResponse.json(
        {
          error:
            "Temporary, invalid or suspicious email addresses are not allowed. Please use a valid permanent email address.",
        },
        { status: 400 }
      );
    }

    // Check existing email.
    if (email) {
      const existingEmail =
        await db.orm.public.User
          .where((user) => user.email.eq(email))
          .first();

      if (existingEmail) {
        return NextResponse.json(
          { error: "This email is already registered." },
          { status: 409 }
        );
      }
    }

    // Check existing phone.
    if (phone) {
      const existingPhone =
        await db.orm.public.User
          .where((user) => user.phone.eq(phone))
          .first();

      if (existingPhone) {
        return NextResponse.json(
          { error: "This phone number is already registered." },
          { status: 409 }
        );
      }
    }

    // Prevent duplicate names ignoring spaces,
    // punctuation and case.
    const normalizedNewName = normalizeName(fullName);

    const allUsers = await db.orm.public.User.all();

    const duplicateName = allUsers.find((user: any) => {
      return (
        normalizeName(String(user.fullName || "")) ===
        normalizedNewName
      );
    });

    if (duplicateName) {
      return NextResponse.json(
        {
          error:
            "This name is already registered. Please choose a different name.",
        },
        { status: 409 }
      );
    }

    // Validate referral code.
    let referredById: string | null = null;

    if (referralCode) {
      const referrer =
        await db.orm.public.User
          .where((user) =>
            user.referralCode.eq(referralCode)
          )
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

    // Generate a unique referral code.
    let newReferralCode = "";
    let referralCodeCreated = false;

    for (let attempt = 0; attempt < 10; attempt++) {
      newReferralCode = generateReferralCode();

      const existing =
        await db.orm.public.User
          .where((user) =>
            user.referralCode.eq(newReferralCode)
          )
          .first();

      if (!existing) {
        referralCodeCreated = true;
        break;
      }
    }

    if (!referralCodeCreated) {
      return NextResponse.json(
        { error: "Unable to create account. Please try again." },
        { status: 500 }
      );
    }

    // Generate unique public user ID.
    let publicUserId = "";
    let publicIdCreated = false;

    for (let attempt = 0; attempt < 20; attempt++) {
      publicUserId = generatePublicUserId();

      const existing =
        await db.orm.public.User
          .where((user) =>
            user.publicUserId.eq(publicUserId)
          )
          .first();

      if (!existing) {
        publicIdCreated = true;
        break;
      }
    }

    if (!publicIdCreated) {
      return NextResponse.json(
        { error: "Unable to create account. Please try again." },
        { status: 500 }
      );
    }

    // Create account.
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

    // Welcome bonus.
    try {
      const existingBonus =
        await db.orm.public.Transaction
          .where((transaction) =>
            transaction.referenceId.eq(
              `WELCOME_BONUS:${user.id}`
            )
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
    } catch (error) {
      console.error("WELCOME_BONUS_ERROR:", error);
    }

    // Notify referral ancestors.
    await notifyReferralAncestors(
      referredById,
      String(user.publicUserId)
    );

    // Create session.
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
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    // Keep internal errors in server logs only.
    console.error("REGISTER_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to create account. Please try again." },
      { status: 500 }
    );
  }
}
