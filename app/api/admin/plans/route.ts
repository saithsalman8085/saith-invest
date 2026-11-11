
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import "temporal-polyfill/full/global";
import { Temporal } from "temporal-polyfill";

const PLAN_CATEGORIES = [
  "NORMAL",
  "PREMIUM",
  "LIMITED_TIME",
] as const;

function toKarachiPlainDateTime(date: Date) {
  return Temporal.Instant
    .fromEpochMilliseconds(date.getTime())
    .toZonedDateTimeISO("Asia/Karachi")
    .toPlainDateTime();
}

function getPlanData(body: any) {
  const name = String(body.name || "").trim();

  const depositAmount = Number(body.depositAmount);
  const profitAmount = Number(body.profitAmount);
  const durationDays = Number(body.durationDays);
  const dailyEarning = Number(body.dailyEarning);
  const totalReturn = Number(body.totalReturn);

  const level1Percent = Number(body.level1Percent ?? 12);
  const level2Percent = Number(body.level2Percent ?? 4);
  const level3Percent = Number(body.level3Percent ?? 2);

  const maxPurchasesPerUser = Number(
    body.maxPurchasesPerUser ?? 1
  );

  const referralBonusUSD = Number(
    body.referralBonusUSD ?? 0
  );

  const category = PLAN_CATEGORIES.includes(
    String(body.category || "").toUpperCase() as any
  )
    ? String(body.category).toUpperCase()
    : body.isSpecial === true || body.isSpecial === "true"
      ? "PREMIUM"
      : "NORMAL";

  const isSpecial = category === "PREMIUM";

  const status =
    String(body.status || "DRAFT").toUpperCase() === "PUBLISHED"
      ? "PUBLISHED"
      : "DRAFT";

  let expiresAt: any = null;

  if (category === "LIMITED_TIME") {
    if (body.offerHours !== undefined && body.offerHours !== null) {
      const offerHours = Number(body.offerHours);

      if (
        !Number.isInteger(offerHours) ||
        offerHours < 1
      ) {
        throw new Error(
          "Limited Time offer duration must be at least 1 hour."
        );
      }

      const expiryDate = new Date(
        Date.now() + offerHours * 60 * 60 * 1000
      );

      expiresAt = toKarachiPlainDateTime(expiryDate);
    } else if (body.expiresAt) {
      const expiryDate = new Date(body.expiresAt);

      if (!Number.isFinite(expiryDate.getTime())) {
        throw new Error("Invalid Limited Time expiry date.");
      }

      if (expiryDate.getTime() <= Date.now()) {
        throw new Error(
          "Limited Time expiry must be in the future."
        );
      }

      expiresAt = toKarachiPlainDateTime(expiryDate);
    } else {
      throw new Error(
        "Offer duration in hours is required for Limited Time plans."
      );
    }
  }

  if (!name) {
    throw new Error("Plan name is required.");
  }

  if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
    throw new Error("Invalid deposit amount.");
  }

  if (!Number.isFinite(profitAmount) || profitAmount < 0) {
    throw new Error("Invalid profit amount.");
  }

  if (!Number.isInteger(durationDays) || durationDays <= 0) {
    throw new Error("Invalid duration.");
  }

  if (!Number.isFinite(dailyEarning) || dailyEarning <= 0) {
    throw new Error("Invalid daily earning.");
  }

  if (!Number.isFinite(totalReturn) || totalReturn <= 0) {
    throw new Error("Invalid total return.");
  }

  if (
    !Number.isFinite(level1Percent) ||
    level1Percent < 0 ||
    level1Percent > 100
  ) {
    throw new Error("Invalid Level 1 percentage.");
  }

  if (
    !Number.isFinite(level2Percent) ||
    level2Percent < 0 ||
    level2Percent > 100
  ) {
    throw new Error("Invalid Level 2 percentage.");
  }

  if (
    !Number.isFinite(level3Percent) ||
    level3Percent < 0 ||
    level3Percent > 100
  ) {
    throw new Error("Invalid Level 3 percentage.");
  }

  if (
    !Number.isInteger(maxPurchasesPerUser) ||
    maxPurchasesPerUser < 1
  ) {
    throw new Error(
      "Maximum purchases per user must be at least 1."
    );
  }

  if (
    !Number.isFinite(referralBonusUSD) ||
    referralBonusUSD < 0
  ) {
    throw new Error("Referral bonus cannot be negative.");
  }

  return {
    name,
    depositAmount: String(depositAmount),
    profitAmount: String(profitAmount),
    durationDays,
    dailyEarning: String(dailyEarning),
    totalReturn: String(totalReturn),
    level1Percent: String(level1Percent),
    level2Percent: String(level2Percent),
    level3Percent: String(level3Percent),
    category,
    expiresAt,
    isSpecial,
    maxPurchasesPerUser,
    referralBonusUSD: String(referralBonusUSD),
    status,
  };
}

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const plans =
      await db.orm.public.InvestmentPlan.all();

    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("ADMIN_PLANS_GET_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load plans." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = getPlanData(body);

    const plan =
      await db.orm.public.InvestmentPlan.create(
        data as any
      );

    return NextResponse.json(
      {
        success: true,
        plan,
        message: "Plan created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADMIN_PLAN_CREATE_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create plan.",
      },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const planId = String(body.id || "").trim();

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required." },
        { status: 400 }
      );
    }

    const existingPlan =
      await db.orm.public.InvestmentPlan
        .where((plan) => plan.id.eq(planId))
        .first();

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Plan not found." },
        { status: 404 }
      );
    }

    const data = getPlanData(body);

    const plan =
      await db.orm.public.InvestmentPlan
        .where((item) => item.id.eq(planId))
        .update(data as any);

    return NextResponse.json({
      success: true,
      plan,
      message: "Plan updated successfully.",
    });
  } catch (error) {
    console.error("ADMIN_PLAN_UPDATE_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update plan.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const planId = String(body.id || "").trim();

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required." },
        { status: 400 }
      );
    }

    const plan =
      await db.orm.public.InvestmentPlan
        .where((item) => item.id.eq(planId))
        .first();

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found." },
        { status: 404 }
      );
    }

    const investments =
      await db.orm.public.Investment
        .where((investment) =>
          investment.planId.eq(planId)
        )
        .all();

    if (investments.length > 0) {
      return NextResponse.json(
        {
          error:
            "This plan has investments and cannot be deleted.",
        },
        { status: 400 }
      );
    }

    await db.orm.public.InvestmentPlan
      .where((item) => item.id.eq(planId))
      .delete();

    return NextResponse.json({
      success: true,
      message: "Plan deleted successfully.",
    });
  } catch (error) {
    console.error("ADMIN_PLAN_DELETE_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete plan.",
      },
      { status: 400 }
    );
  }
}
