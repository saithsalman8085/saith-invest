import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

function isWithdrawalTimeAllowed(
  openingHour: number,
  closingHour: number
) {
  const now = new Date();

  const pakistanTime = new Date(
    now.toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
    })
  );

  const day = pakistanTime.getDay();
  const hours = pakistanTime.getHours();

  // Sunday = 0, Saturday = 6
  if (day === 0 || day === 6) {
    return false;
  }

  return hours >= openingHour && hours < closingHour;
}

function getPakistanDayRange() {
  const now = new Date();

  const pakistanDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const start = new Date(`${pakistanDate}T00:00:00+05:00`);
  const end = new Date(`${pakistanDate}T23:59:59.999+05:00`);

  return { start, end };
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

    // Platform settings
    const settings =
      await db.orm.public.PlatformSettings.first();

    // Maintenance Mode
    if (settings?.maintenanceMode) {
      return NextResponse.json(
        {
          error:
            "Platform is currently under maintenance. New withdrawal requests are temporarily unavailable.",
        },
        { status: 503 }
      );
    }

    // Live withdrawal settings
    const withdrawalFeePercent = Number(
      settings?.withdrawalFeePercent ?? 12
    );

    const usdRate = Number(
      settings?.exchangeRate ?? 300
    );

    const openingHour = Number(
      settings?.withdrawalOpeningHour ?? 9
    );

    const closingHour = Number(
      settings?.withdrawalClosingHour ?? 23
    );

    if (
      !Number.isFinite(withdrawalFeePercent) ||
      withdrawalFeePercent < 0 ||
      withdrawalFeePercent > 100
    ) {
      return NextResponse.json(
        { error: "Invalid withdrawal fee configuration." },
        { status: 500 }
      );
    }

    if (!Number.isFinite(usdRate) || usdRate <= 0) {
      return NextResponse.json(
        { error: "Invalid exchange rate configuration." },
        { status: 500 }
      );
    }

    if (
      !Number.isInteger(openingHour) ||
      !Number.isInteger(closingHour) ||
      openingHour < 0 ||
      openingHour > 23 ||
      closingHour < 1 ||
      closingHour > 24 ||
      openingHour >= closingHour
    ) {
      return NextResponse.json(
        { error: "Invalid withdrawal schedule configuration." },
        { status: 500 }
      );
    }

    if (
      !isWithdrawalTimeAllowed(
        openingHour,
        closingHour
      )
    ) {
      return NextResponse.json(
        {
          error:
            `Withdrawals are available Monday to Friday, ${String(
              openingHour
            ).padStart(2, "0")}:00 to ${String(
              closingHour
            ).padStart(2, "0")}:00.`,
        },
        { status: 400 }
      );
    }

    // User must have at least one qualifying investment/plan.
    const investments =
      await db.orm.public.Investment
        .where((investment) =>
          investment.userId.eq(userId)
        )
        .all();

    const hasQualifyingInvestment =
      investments.some(
        (investment) =>
          String(investment.status) !== "CANCELLED"
      );

    if (!hasQualifyingInvestment) {
      return NextResponse.json(
        {
          error:
            "You must invest in at least one plan before you can withdraw.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const amountUSD = Number(body.amountUSD);

    // Minimum $1 and maximum $2,000 per withdrawal
    if (
      !Number.isFinite(amountUSD) ||
      amountUSD < 1 ||
      amountUSD > 2000
    ) {
      return NextResponse.json(
        {
          error:
            "Withdrawal amount must be between $1 and $2,000.",
        },
        { status: 400 }
      );
    }

    // Only 1 withdrawal per user per Pakistan calendar day
    const { start, end } = getPakistanDayRange();

    const withdrawals =
      await db.orm.public.Withdrawal
        .where((withdrawal) =>
          withdrawal.userId.eq(userId)
        )
        .all();

    const alreadyWithdrawnToday =
  withdrawals.some((withdrawal) => {
    const requestedAt = new Date(
      String(withdrawal.requestedAt)
    );

    return (
      requestedAt >= start &&
      requestedAt <= end &&
      String(withdrawal.status) !== "CANCELLED"
    );
  });

    if (alreadyWithdrawnToday) {
      return NextResponse.json(
        {
          error:
            "You can make only 1 withdrawal per day. Please try again tomorrow.",
        },
        { status: 400 }
      );
    }

    const amountUSDValue =
      amountUSD.toFixed(2);

    const profile =
      await db.orm.public.WithdrawalProfile
        .where((profile) =>
          profile.userId.eq(userId)
        )
        .first();

    if (!profile) {
      return NextResponse.json(
        {
          error:
            "Withdrawal KYC is required before submitting a withdrawal.",
        },
        { status: 400 }
      );
    }

    if (!profile.isLocked) {
      return NextResponse.json(
        {
          error:
            "Complete and lock your withdrawal KYC before submitting a withdrawal.",
        },
        { status: 400 }
      );
    }

    const feeUSD = Number(
      (
        (amountUSD * withdrawalFeePercent) /
        100
      ).toFixed(2)
    );

    const netAmountUSD = Number(
      (amountUSD - feeUSD).toFixed(2)
    );

    const payoutPKR = Number(
      (netAmountUSD * usdRate).toFixed(2)
    );

    if (netAmountUSD <= 0) {
      return NextResponse.json(
        { error: "Withdrawal amount is too small." },
        { status: 400 }
      );
    }

    // Calculate wallet balance
    const transactions =
      await db.orm.public.Transaction
        .where((transaction) =>
          transaction.userId.eq(userId)
        )
        .all();

    let balance = 0;

    const creditTypes = [
      "DEPOSIT",
      "DAILY_EARNING",
      "REFERRAL_COMMISSION",
      "ACTIVE_USER_REWARD",
    ];

    const debitTypes = [
      "WITHDRAWAL",
      "WITHDRAWAL_FEE",
      "INVESTMENT",
    ];

    for (const transaction of transactions) {
      if (
        String(transaction.status) !==
        "COMPLETED"
      ) {
        continue;
      }

      const transactionAmount =
        Number(transaction.amountUSD) || 0;

      if (
        creditTypes.includes(
          String(transaction.type)
        )
      ) {
        balance += transactionAmount;
      }

      if (
        debitTypes.includes(
          String(transaction.type)
        )
      ) {
        balance -= transactionAmount;
      }
    }

    balance = Number(balance.toFixed(2));

    if (amountUSD > balance) {
      return NextResponse.json(
        {
          error:
            `Insufficient balance. Available balance: $${balance.toFixed(
              2
            )}.`,
        },
        { status: 400 }
      );
    }

    const withdrawalData = {
      userId,
      amountUSD: amountUSDValue,
      feePercent:
        withdrawalFeePercent.toFixed(4),
      feeUSD: feeUSD.toFixed(2),
      netAmountUSD:
        netAmountUSD.toFixed(2),
      exchangeRate:
        usdRate.toFixed(4),
      payoutPKR:
        payoutPKR.toFixed(2),
      cnicNumber: profile.cnicNumber,
      easypaisaNumber:
        profile.easypaisaNumber,
      accountName: profile.accountName,
      status: "PENDING",
    } as any;

    const withdrawal =
      await db.orm.public.Withdrawal.create(
        withdrawalData
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Withdrawal request submitted successfully.",
        withdrawal: {
          id: withdrawal.id,
          amountUSD:
            withdrawal.amountUSD,
          feePercent:
            withdrawal.feePercent,
          feeUSD:
            withdrawal.feeUSD,
          netAmountUSD:
            withdrawal.netAmountUSD,
          exchangeRate:
            withdrawal.exchangeRate,
          payoutPKR:
            withdrawal.payoutPKR,
          status:
            withdrawal.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "WITHDRAWAL_POST_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to submit withdrawal request.",
      },
      { status: 500 }
    );
  }
}