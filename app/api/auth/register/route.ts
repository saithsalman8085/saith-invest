import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isDisposableEmail } from "disposable-email-domains-js";
import { db } from "@/lib/prisma";

function generateReferralCode() {
return (
"SAITH" +
Math.random().toString(36).substring(2, 8).toUpperCase()
);
}

function generatePublicUserId() {
return String(Math.floor(100000 + Math.random() * 900000));
}

const BLOCKED_EMAIL_DOMAINS = new Set([
"caps7.com",
]);

function isBlockedEmail(email: string) {
const domain = email.split("@")[1]?.toLowerCase().trim();

if (!domain) {
return false;
}

if (BLOCKED_EMAIL_DOMAINS.has(domain)) {
return true;
}

return isDisposableEmail(email);
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

return NextResponse.json(
  {
    success: true,
    userId: user.id,
    publicUserId: user.publicUserId,
    message: "Account created successfully.",
  },
  { status: 201 }
);


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
