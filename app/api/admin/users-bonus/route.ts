
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const codes = await db.orm.public.UserBonusCode.all();
    const claims = await db.orm.public.UserBonusClaim.all();
    const users = await db.orm.public.User.all();

    const result = codes.map((code: any) => {
      const codeClaims = claims.filter(
        (claim: any) => claim.bonusCodeId === code.id
      );

      return {
        ...code,
        claims: codeClaims.map((claim: any) => {
          const user = users.find(
            (u: any) => u.id === claim.userId
          );

          return {
            ...claim,
            user: user
              ? {
                  id: user.id,
                  publicUserId: user.publicUserId,
                  fullName: user.fullName,
                }
              : null,
          };
        }),
      };
    });

    return NextResponse.json({
      success: true,
      codes: result,
    });
  } catch (error) {
    console.error("ADMIN_USERS_BONUS_GET_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load bonus codes." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const type = String(body.type || "");
    const poolAmount = Number(body.poolAmount);
    const maxClaims = Number(body.maxClaims);
    const expiryHoursInput = body.expiryHours ?? null;
    const publicUserId = String(body.publicUserId || "").trim();

    if (!["ALL_USERS", "SINGLE_USER"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid bonus type." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(poolAmount) ||
      poolAmount <= 0
    ) {
      return NextResponse.json(
        { error: "Bonus amount must be greater than zero." },
        { status: 400 }
      );
    }

    const roundedPool = Number(poolAmount.toFixed(2));

    let assignedUserId: string | null = null;
    let claimsLimit = maxClaims;

    if (type === "ALL_USERS") {
      if (
        !Number.isInteger(maxClaims) ||
        maxClaims < 1
      ) {
        return NextResponse.json(
          { error: "Maximum users must be at least 1." },
          { status: 400 }
        );
      }

      claimsLimit = maxClaims;
    }

    if (type === "SINGLE_USER") {
      if (!/^\d{6}$/.test(publicUserId)) {
        return NextResponse.json(
          { error: "Enter a valid 6-digit User ID." },
          { status: 400 }
        );
      }

      const targetUser = await db.orm.public.User
        .where((user: any) =>
          user.publicUserId.eq(publicUserId)
        )
        .first();

      if (!targetUser) {
        return NextResponse.json(
          { error: "User not found." },
          { status: 404 }
        );
      }

      assignedUserId = targetUser.id;
      claimsLimit = 1;
    }

    let expiresAt: Date | null = null;

if (expiryHoursInput !== null && expiryHoursInput !== "") {
  const hours = Number(expiryHoursInput);

  if (!Number.isInteger(hours) || hours <= 0) {
    return NextResponse.json(
      { error: "Expiry hours must be a positive integer." },
      { status: 400 }
    );
  }

  expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
}

    let code = "";
    let created = null;

    // Retry if a generated code already exists.
    for (let attempt = 0; attempt < 5; attempt++) {
      code = generateCode();

      const existing = await db.orm.public.UserBonusCode
        .where((item: any) => item.code.eq(code))
        .first();

      if (existing) continue;

      created = await db.orm.public.UserBonusCode.create({
        code,
        type,
        status: "ACTIVE",
        poolAmount: String(roundedPool),
        distributedAmount: "0",
        maxClaims: claimsLimit,
        claimCount: 0,
        assignedUserId,
        createdById: admin.id,
        expiresAt,
      } as any);

      break;
    }

    if (!created) {
      return NextResponse.json(
        { error: "Unable to generate a unique bonus code. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        code: created,
        message: "Bonus code generated successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADMIN_USERS_BONUS_POST_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate bonus code.",
      },
      { status: 500 }
    );
  }
}
