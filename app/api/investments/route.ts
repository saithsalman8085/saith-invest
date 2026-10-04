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

    const amount = Number(transaction.amountUSD) || 0;

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

    // Maintenance Mode
    const settings =
      await db.orm.public.PlatformSettings.first();

    if (settings?.maintenanceMode) {
      return NextResponse.json(
        {
          error:
            "Platform is currently under maintenance. New investments are temporarily unavailable.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const planId = String(body.planId || "").trim();

    if (!planId) {
      return NextResponse.json(
        { error: "Plan is required." },
        { status: 400 }
      );
    }

    const plan =
      await db.orm.public.InvestmentPlan
        .where((item) => item.id.eq(planId))
        .first();

    if (!plan) {
      return NextResponse.json(
        { error: "Investment plan not found." },
        { status: 404 }
      );
    }

    if (String(plan.status) !== "PUBLISHED") {
      return NextResponse.json(
        { error: "This investment plan is not available." },
        { status: 400 }
      );
    }

    const amount = Number(plan.depositAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid plan deposit amount." },
        { status: 400 }
      );
    }

    const maxPurchases =
      Number(plan.maxPurchasesPerUser) || 1;

    const userInvestments =
      await db.orm.public.Investment
        .where((investment) =>
          investment.userId.eq(userId)
        )
        .all();

    const activePurchases = userInvestments.filter(
      (investment) =>
        investment.planId === planId &&
        String(investment.status) === "ACTIVE"
    ).length;

    if (activePurchases >= maxPurchases) {
      return NextResponse.json(
        {
          error:
            maxPurchases === 1
              ? "You already have an active investment in this plan."
              : `You can have a maximum of ${maxPurchases} active purchases of this plan.`,
        },
        { status: 400 }
      );
    }

    const balance = await getWalletBalance(userId);

    if (balance < amount) {
      return NextResponse.json(
        {
          error: "Insufficient wallet balance.",
          availableBalance: balance,
          requiredAmount: amount,
        },
        { status: 400 }
      );
    }

    const durationDays = Number(plan.durationDays);

    if (
      !Number.isInteger(durationDays) ||
      durationDays <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid investment duration." },
        { status: 400 }
      );
    }

    const now = new Date();

    const endsAt = new Date(
      now.getTime() +
        durationDays *
          24 *
          60 *
          60 *
          1000
    );

    const nextCollectionAt = new Date(
      now.getTime() +
        24 *
          60 *
          60 *
          1000
    );

    const nowTemporal = toPlainDateTime(now);
    const endsAtTemporal = toPlainDateTime(endsAt);
    const nextCollectionAtTemporal =
      toPlainDateTime(nextCollectionAt);

    const investment =
      await db.orm.public.Investment.create({
        userId,
        planId,
        amount: String(amount),
        durationDays,
        dailyReturn: plan.dailyEarning,
        level1Percent: plan.level1Percent,
        level2Percent: plan.level2Percent,
        level3Percent: plan.level3Percent,
        startedAt: nowTemporal,
        endsAt: endsAtTemporal,
        lastCollectedAt: nowTemporal,
        nextCollectionAt: nextCollectionAtTemporal,
        status: "ACTIVE",
      } as any);

    const balanceAfterInvestment =
      balance - amount;

    await db.orm.public.Transaction.create({
      userId,
      type: "INVESTMENT",
      status: "COMPLETED",
      amountUSD: String(amount),
      balanceBefore: String(balance),
      balanceAfter: String(balanceAfterInvestment),
      referenceId:
        `INVESTMENT:${investment.id}`,
      description:
        `Investment in ${plan.name}`,
    } as any);

    const firstDayEarning =
      Number(plan.dailyEarning);

    if (
      Number.isFinite(firstDayEarning) &&
      firstDayEarning > 0
    ) {
      const earningBalanceBefore =
        balanceAfterInvestment;

      const earningBalanceAfter =
        earningBalanceBefore +
        firstDayEarning;

      const earningTransaction =
        await db.orm.public.Transaction.create({
          userId,
          type: "DAILY_EARNING",
          status: "COMPLETED",
          amountUSD: String(firstDayEarning),
          balanceBefore:
            String(earningBalanceBefore),
          balanceAfter:
            String(earningBalanceAfter),
          referenceId:
            `DAILY_EARNING:${investment.id}:DAY1`,
          description:
            `First day earning from ${plan.name}`,
        } as any);

      await db.orm.public.EarningCollection.create({
        investmentId: investment.id,
        userId,
        amount: String(firstDayEarning),
        collectedAt: nowTemporal,
        transactionId: earningTransaction.id,
      } as any);
    }

    const buyer =
      await db.orm.public.User
        .where((user) => user.id.eq(userId))
        .first();

    let directReferralBonus = 0;

    if (
      buyer?.referredById &&
      Number(plan.referralBonusUSD) > 0
    ) {
      directReferralBonus =
        Number(plan.referralBonusUSD);

      const referrerId = buyer.referredById;

      const referrerBalance =
        await getWalletBalance(referrerId);

      const referrerBalanceAfter =
        referrerBalance +
        directReferralBonus;

      await db.orm.public.Transaction.create({
        userId: referrerId,
        type: "REFERRAL_COMMISSION",
        status: "COMPLETED",
        amountUSD: String(directReferralBonus),
        balanceBefore: String(referrerBalance),
        balanceAfter: String(referrerBalanceAfter),
        referenceId:
          `REFERRAL_BONUS:${investment.id}`,
        description:
          `Instant referral bonus from ${plan.name}`,
      } as any);
    }

    const referralPercents = [
      Number(plan.level1Percent),
      Number(plan.level2Percent),
      Number(plan.level3Percent),
    ];

    let currentUserId:
      | string
      | null =
      buyer?.referredById || null;

    const referralLevels = [
      "LEVEL_1",
      "LEVEL_2",
      "LEVEL_3",
    ];

    for (
      let index = 0;
      index < 3 && currentUserId;
      index++
    ) {
      const beneficiary =
        await db.orm.public.User
          .where((user) =>
            user.id.eq(currentUserId!)
          )
          .first();

      if (!beneficiary) {
        break;
      }

      const percent =
        referralPercents[index] || 0;

      if (percent > 0) {
        const commissionAmount =
          amount * (percent / 100);

        if (commissionAmount > 0) {
          const beneficiaryBalance =
            await getWalletBalance(
              beneficiary.id
            );

          const beneficiaryBalanceAfter =
            beneficiaryBalance +
            commissionAmount;

          await db.orm.public.ReferralCommission.create({
            beneficiaryId: beneficiary.id,
            sourceUserId: userId,
            investmentId: investment.id,
            level: referralLevels[index],
            percent: String(percent),
            investmentAmount: String(amount),
            commissionAmount:
              String(commissionAmount),
          } as any);

          await db.orm.public.Transaction.create({
            userId: beneficiary.id,
            type: "REFERRAL_COMMISSION",
            status: "COMPLETED",
            amountUSD: String(commissionAmount),
            balanceBefore:
              String(beneficiaryBalance),
            balanceAfter:
              String(beneficiaryBalanceAfter),
            referenceId:
              `REFERRAL:${investment.id}:LEVEL_${index + 1}`,
            description:
              `Level ${index + 1} referral commission from ${plan.name}`,
          } as any);
        }
      }

      currentUserId =
        beneficiary.referredById || null;
    }

    if (plan.isSpecial) {
      await db.orm.public.User
        .where((user) =>
          user.id.eq(userId)
        )
        .update({
          premiumBadge: true,
        } as any);
    }

    return NextResponse.json(
      {
        success: true,
        message: plan.isSpecial
          ? "Premium investment created. First day earning credited and premium badge activated."
          : "Investment created successfully. First day earning credited.",
        investment,
        firstDayEarning,
        directReferralBonus,
        premiumBadge: Boolean(plan.isSpecial),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "INVESTMENT_CREATE_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create investment.",
      },
      { status: 500 }
    );
  }
}