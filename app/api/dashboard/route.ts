
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

    const transactions = await db.orm.public.Transaction
      .where((transaction) => transaction.userId.eq(userId))
      .all();

    let balance = 0;
    let totalEarnings = 0;

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

      if (
        transaction.type === "DAILY_EARNING" ||
        transaction.type === "REFERRAL_COMMISSION" ||
        transaction.type === "ACTIVE_USER_REWARD"
      ) {
        totalEarnings += amount;
      }
    }

    const investments = await db.orm.public.Investment
      .where((investment) => investment.userId.eq(userId))
      .all();

      console.log(
  "DB NEXT COLLECTION:",
  investments.map((investment) => ({
    id: investment.id,
    nextCollectionAt: String(investment.nextCollectionAt),
  }))
);

    const activeInvestments = investments
      .filter((investment) => investment.status === "ACTIVE")
      .sort(
        (a, b) =>
          new Date(String(a.startedAt)).getTime() -
          new Date(String(b.startedAt)).getTime()
      );

      console.log(
  "NEXT CHECK:",
  investments.map((investment) => ({
    id: investment.id,
    nextCollectionAt: String(investment.nextCollectionAt),
    nextISO: investment.nextCollectionAt
      ? new Date(`${String(investment.nextCollectionAt)}+05:00`).toISOString()
      : null,
  }))
);

    const totalInvested = investments
      .filter(
        (investment) => investment.status !== "CANCELLED"
      )
      .reduce(
        (total, investment) =>
          total + Number(investment.amount),
        0
      );

    const referrals = await db.orm.public.User
      .where((referral) => referral.referredById.eq(userId))
      .all();

    const recentTransactions = [...transactions]
      .sort(
        (a, b) =>
          new Date(String(b.createdAt)).getTime() -
          new Date(String(a.createdAt)).getTime()
      )
      .slice(0, 5);

    return NextResponse.json({
      success: true,

      user: {
        fullName: user.fullName,
        referralCode: user.referralCode,
        premiumBadge: user.premiumBadge,
      },

      stats: {
        balance: Number(balance.toFixed(2)),
        totalInvested: Number(totalInvested.toFixed(2)),
        totalEarnings: Number(totalEarnings.toFixed(2)),
        referrals: referrals.length,
      },
      

      activeInvestments: activeInvestments.map(
        (investment) => ({
          id: investment.id,
          amount: Number(investment.amount),
          durationDays: investment.durationDays,
          dailyReturn: Number(
            Number(investment.dailyReturn).toFixed(2)
          ),
          startedAt: new Date(
            String(investment.startedAt)
          ).toISOString(),
          endsAt: new Date(
            String(investment.endsAt)
          ).toISOString(),
          nextCollectionAt:
            investment.nextCollectionAt
              ? new Date(
                  String(investment.nextCollectionAt)
                ).toISOString()
              : null,
          status: investment.status,
        })
      ),

      transactions: recentTransactions.map(
        (transaction) => ({
          id: transaction.id,
          type: transaction.type,
          status: transaction.status,
          amountUSD: Number(transaction.amountUSD),
          createdAt: new Date(
            String(transaction.createdAt)
          ).toISOString(),
        })
      ),
    });
  } catch (error) {
    console.error("DASHBOARD_GET_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load dashboard." },
      { status: 500 }
    );
  }
}
