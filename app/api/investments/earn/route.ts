import { NextRequest, NextResponse } from "next/server";
import { Temporal } from "temporal-polyfill";
import { db } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

const CREDIT_TYPES = [
  "DEPOSIT",
  "DAILY_EARNING",
  "REFERRAL_COMMISSION",
  "ACTIVE_USER_REWARD",
];

const DEBIT_TYPES = [
  "INVESTMENT",
  "WITHDRAWAL",
  "WITHDRAWAL_FEE",
];

function toPlainDateTime(date: Date) {
  return Temporal.PlainDateTime.from(
    date.toLocaleString("sv-SE", {
      timeZone: "Asia/Karachi",
    })
  );
}

async function getWalletBalance(userId: string) {
  const transactions =
    await db.orm.public.Transaction
      .where((transaction) =>
        transaction.userId.eq(userId)
      )
      .all();

  let balance = 0;

  for (const transaction of transactions) {
    if (String(transaction.status) !== "COMPLETED") {
      continue;
    }

    const amount =
      Number(transaction.amountUSD) || 0;

    if (CREDIT_TYPES.includes(String(transaction.type))) {
      balance += amount;
    }

    if (DEBIT_TYPES.includes(String(transaction.type))) {
      balance -= amount;
    }
  }

  return balance;
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

    const investmentId =
      String(body.investmentId || "").trim();

    if (!investmentId) {
      return NextResponse.json(
        { error: "Investment is required." },
        { status: 400 }
      );
    }

    const investment =
      await db.orm.public.Investment
        .where((item) => item.id.eq(investmentId))
        .first();

    if (!investment) {
      return NextResponse.json(
        { error: "Investment not found." },
        { status: 404 }
      );
    }

    if (investment.userId !== userId) {
      return NextResponse.json(
        { error: "You cannot collect this investment." },
        { status: 403 }
      );
    }

    if (String(investment.status) !== "ACTIVE") {
      return NextResponse.json(
        { error: "This investment is no longer active." },
        { status: 400 }
      );
    }

    if (!investment.nextCollectionAt) {
      return NextResponse.json(
        { error: "No earning is currently scheduled." },
        { status: 400 }
      );
    }

    const now = new Date();

    const nextCollectionAt = new Date(
      String(investment.nextCollectionAt)
    );

    const remainingMs =
      nextCollectionAt.getTime() - now.getTime();

    if (remainingMs > 0) {
      const totalSeconds =
        Math.ceil(remainingMs / 1000);

      const hours =
        Math.floor(totalSeconds / 3600);

      const minutes =
        Math.floor((totalSeconds % 3600) / 60);

      const seconds =
        totalSeconds % 60;

      return NextResponse.json(
        {
          error: `Next earning will be available in ${hours}h ${minutes}m ${seconds}s.`,
          remainingSeconds: totalSeconds,
          nextCollectionAt:
            nextCollectionAt.toISOString(),
        },
        { status: 400 }
      );
    }

    const durationDays =
      Number(investment.durationDays);

    if (
      !Number.isInteger(durationDays) ||
      durationDays <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid investment duration." },
        { status: 400 }
      );
    }

    const previousCollections =
      await db.orm.public.EarningCollection
        .where((item) =>
          item.investmentId.eq(investment.id)
        )
        .all();

    const collectedDays =
      previousCollections.length;

    if (collectedDays >= durationDays) {
      await db.orm.public.Investment
        .where((item) =>
          item.id.eq(investment.id)
        )
        .update({
          status: "COMPLETED",
          nextCollectionAt: null,
        } as any);

      return NextResponse.json(
        {
          error: "This investment has already completed.",
        },
        { status: 400 }
      );
    }

    const earning =
      Number(investment.dailyReturn);

    if (!Number.isFinite(earning) || earning <= 0) {
      return NextResponse.json(
        { error: "Invalid daily earning amount." },
        { status: 400 }
      );
    }

    const balance =
      await getWalletBalance(userId);

    const balanceAfter =
      balance + earning;

    const nowTemporal =
      toPlainDateTime(now);

    const earningTransaction =
      await db.orm.public.Transaction.create({
        userId,
        type: "DAILY_EARNING",
        status: "COMPLETED",
        amountUSD: String(earning),
        balanceBefore: String(balance),
        balanceAfter: String(balanceAfter),
        referenceId:
          `DAILY_EARNING:${investment.id}:DAY${collectedDays + 1}`,
        description:
          `Daily earning from investment`,
      } as any);

    await db.orm.public.EarningCollection.create({
      investmentId: investment.id,
      userId,
      amount: String(earning),
      collectedAt: nowTemporal,
      transactionId: earningTransaction.id,
    } as any);

    const totalCollectedDays =
      collectedDays + 1;

    if (totalCollectedDays >= durationDays) {
      await db.orm.public.Investment
        .where((item) =>
          item.id.eq(investment.id)
        )
        .update({
          status: "COMPLETED",
          lastCollectedAt: nowTemporal,
          nextCollectionAt: null,
        } as any);
    } else {
      // EXACTLY 24 HOURS from the collection time.
      const nextCollectionDate = new Date(
        now.getTime() + 24 * 60 * 60 * 1000
      );

      const nextCollectionTemporal =
        toPlainDateTime(nextCollectionDate);

      await db.orm.public.Investment
        .where((item) =>
          item.id.eq(investment.id)
        )
        .update({
          lastCollectedAt: nowTemporal,
          nextCollectionAt:
            nextCollectionTemporal,
        } as any);
    }

    return NextResponse.json(
      {
        success: true,
        earning: {
          amount: earning,
        },
        message:
          "Daily earning collected successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "INVESTMENT_EARNING_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to collect earnings.",
      },
      { status: 500 }
    );
  }
}