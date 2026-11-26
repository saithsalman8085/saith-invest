
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please login first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const codeInput = String(body.code || "").trim().toUpperCase();

    if (!codeInput) {
      return NextResponse.json(
        { error: "Please enter a bonus code." },
        { status: 400 }
      );
    }

    const result: any = await db.transaction(
      async (tx) => {
        const code = await tx.orm.public.UserBonusCode
          .where((item: any) => item.code.eq(codeInput))
          .first();

        if (!code) {
          return { error: "Invalid bonus code.", status: 404 };
        }

        if (code.status !== "ACTIVE") {
          return {
            error: "This bonus code is no longer active.",
            status: 400,
          };
        }

        if (
          code.expiresAt &&
          new Date(code.expiresAt.toString()) <= new Date()
        ) {
          await tx.orm.public.UserBonusCode
            .where((item: any) => item.id.eq(code.id))
            .update({ status: "EXPIRED" } as any);

          return {
            error: "This bonus code has expired.",
            status: 400,
          };
        }

        if (
          code.type === "SINGLE_USER" &&
          code.assignedUserId !== userId
        ) {
          return {
            error: "This bonus code is assigned to another user.",
            status: 403,
          };
        }

        const claims = await tx.orm.public.UserBonusClaim
          .where((claim: any) => claim.bonusCodeId.eq(code.id))
          .all();

        if (claims.some((claim: any) => claim.userId === userId)) {
          return {
            error: "You have already redeemed this code.",
            status: 400,
          };
        }

        if (code.claimCount >= code.maxClaims) {
          await tx.orm.public.UserBonusCode
            .where((item: any) => item.id.eq(code.id))
            .update({ status: "COMPLETED" } as any);

          return {
            error: "This bonus code has already been fully claimed.",
            status: 400,
          };
        }

        const distributed = Number(code.distributedAmount);
        const pool = Number(code.poolAmount);

        const remainingPool = Number(
          (pool - distributed).toFixed(2)
        );

        const remainingClaims = code.maxClaims - code.claimCount;

        if (
          !Number.isFinite(pool) ||
          !Number.isFinite(distributed) ||
          remainingPool <= 0 ||
          remainingClaims <= 0
        ) {
          return {
            error: "No bonus amount remains.",
            status: 400,
          };
        }

        let bonusAmount =
          code.type === "SINGLE_USER"
            ? remainingPool
            : Number(
                (remainingPool / remainingClaims).toFixed(2)
              );

        bonusAmount = Number(
          Math.min(bonusAmount, remainingPool).toFixed(2)
        );

        if (!Number.isFinite(bonusAmount) || bonusAmount <= 0) {
          return {
            error: "Bonus amount is unavailable.",
            status: 400,
          };
        }

        // Wallet balance from completed transactions
        const transactions = await tx.orm.public.Transaction
          .where((transaction: any) =>
            transaction.userId.eq(userId)
          )
          .all();

        const credits = [
          "DEPOSIT",
          "DAILY_EARNING",
          "REFERRAL_COMMISSION",
          "ACTIVE_USER_REWARD",
          "ADMIN_ADJUSTMENT",
        ];

        const debits = [
          "INVESTMENT",
          "WITHDRAWAL",
          "WITHDRAWAL_FEE",
        ];

        let balance = 0;

        for (const transaction of transactions) {
          if (transaction.status !== "COMPLETED") continue;

          const amount = Number(transaction.amountUSD);

          if (credits.includes(transaction.type)) {
            balance += amount;
          } else if (debits.includes(transaction.type)) {
            balance -= amount;
          }
        }

        const balanceAfter = Number(
          (balance + bonusAmount).toFixed(2)
        );

        // Create wallet credit
        const walletTransaction =
          await tx.orm.public.Transaction.create({
            userId,
            type: "ADMIN_ADJUSTMENT",
            status: "COMPLETED",
            amountUSD: String(bonusAmount),
            balanceBefore: String(balance.toFixed(2)),
            balanceAfter: String(balanceAfter.toFixed(2)),
            referenceId: `BONUS_CLAIM:${code.id}:${userId}`,
            description: `Bonus code redeemed: ${code.code}`,
          } as any);

        // Save claim
        await tx.orm.public.UserBonusClaim.create({
          bonusCodeId: code.id,
          userId,
          amountUSD: String(bonusAmount),
          transactionId: walletTransaction.id,
        } as any);

        const newClaimCount = code.claimCount + 1;

        const newDistributed = Number(
          (distributed + bonusAmount).toFixed(2)
        );

        const newStatus =
          newClaimCount >= code.maxClaims ||
          newDistributed >= pool
            ? "COMPLETED"
            : "ACTIVE";

        // Update bonus pool
        await tx.orm.public.UserBonusCode
          .where((item: any) => item.id.eq(code.id))
          .update({
            claimCount: newClaimCount,
            distributedAmount: String(newDistributed),
            status: newStatus,
          } as any);

        return {
          success: true,
          message: `Bonus successfully redeemed! $${bonusAmount.toFixed(2)} added to your wallet.`,
          bonusAmount,
          balance: balanceAfter,
        };
      },
    );

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("BONUS_REDEEM_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to redeem bonus code. Please try again." },
      { status: 500 }
    );
  }
}
