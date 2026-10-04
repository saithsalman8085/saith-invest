import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const investmentId = String(body.investmentId || "").trim();

    if (!investmentId) {
      return NextResponse.json(
        { error: "Investment ID is required." },
        { status: 400 }
      );
    }

    const investment = await db.orm.public.Investment
      .where((investment) => investment.id.eq(investmentId))
      .first();

    if (!investment || investment.userId !== userId) {
      return NextResponse.json(
        { error: "Investment not found." },
        { status: 404 }
      );
    }

    if (investment.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "This investment is no longer active." },
        { status: 400 }
      );
    }

    const now = new Date();

    const investmentEndsAt = new Date(
      String(investment.endsAt)
    );

    if (now >= investmentEndsAt) {
      await db.orm.public.Investment
        .where((item) => item.id.eq(investment.id))
        .update({
          status: "COMPLETED",
        } as any);

      return NextResponse.json(
        { error: "This investment has completed." },
        { status: 400 }
      );
    }

    if (investment.nextCollectionAt) {
      const nextCollection = new Date(
        String(investment.nextCollectionAt)
      );

      if (now < nextCollection) {
        const remainingMs =
          nextCollection.getTime() - now.getTime();

        return NextResponse.json(
          {
            error: "Your next earning is not ready yet.",
            nextCollectionAt: nextCollection.toISOString(),
            remainingSeconds: Math.ceil(
              remainingMs / 1000
            ),
          },
          { status: 400 }
        );
      }
    }

    const dailyAmount = Number(
      Number(investment.dailyReturn).toFixed(2)
    );

    if (!Number.isFinite(dailyAmount) || dailyAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid daily earning amount." },
        { status: 400 }
      );
    }

    const transactions = await db.orm.public.Transaction
      .where((transaction) => transaction.userId.eq(userId))
      .all();

    let balance = 0;

    const creditTypes = [
      "DEPOSIT",
      "DAILY_EARNING",
      "REFERRAL_COMMISSION",
      "ACTIVE_USER_REWARD",
    ];

    const debitTypes = [
      "INVESTMENT",
      "WITHDRAWAL",
      "WITHDRAWAL_FEE",
    ];

    for (const transaction of transactions) {
      if (transaction.status !== "COMPLETED") {
        continue;
      }

      const amount = Number(transaction.amountUSD);

      if (creditTypes.includes(transaction.type)) {
        balance += amount;
      }

      if (debitTypes.includes(transaction.type)) {
        balance -= amount;
      }
    }

    balance = Number(balance.toFixed(2));

    const balanceAfter = Number(
      (balance + dailyAmount).toFixed(2)
    );

    const earning =
      await db.orm.public.EarningCollection.create({
        investmentId: investment.id,
        userId,
        amount: dailyAmount.toFixed(2),
        collectedAt: now,
      } as any);

    const transaction =
      await db.orm.public.Transaction.create({
        userId,
        type: "DAILY_EARNING",
        status: "COMPLETED",
        amountUSD: dailyAmount.toFixed(2),
        balanceBefore: balance.toFixed(2),
        balanceAfter: balanceAfter.toFixed(2),
        referenceId: `EARNING:${earning.id}`,
        description:
          `Daily earning from investment ${investment.id}`,
      } as any);

    await db.orm.public.EarningCollection
      .where((item) => item.id.eq(earning.id))
      .update({
        transactionId: transaction.id,
      } as any);

    const nextCollectionAt = new Date(
      now.getTime() + 24 * 60 * 60 * 1000
    );

    await db.orm.public.Investment
      .where((item) => item.id.eq(investment.id))
      .update({
        lastCollectedAt: now,
        nextCollectionAt,
      } as any);

    return NextResponse.json({
      success: true,
      message: "Daily earning collected successfully.",
      earning: {
        amount: dailyAmount,
        collectedAt: now.toISOString(),
        nextCollectionAt: nextCollectionAt.toISOString(),
        balanceAfter,
      },
    });
  } catch (error) {
    console.error("EARNINGS_POST_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to collect daily earning." },
      { status: 500 }
    );
  }
}