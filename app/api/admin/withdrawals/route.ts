import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

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

function calculateBalance(transactions: any[]) {
  let balance = 0;

  for (const transaction of transactions) {
    if (transaction.status !== "COMPLETED") {
      continue;
    }

    const amount = Number(transaction.amountUSD);

    if (!Number.isFinite(amount)) {
      continue;
    }

    if (
      CREDIT_TYPES.includes(
        String(transaction.type)
      )
    ) {
      balance += amount;
    }

    if (
      DEBIT_TYPES.includes(
        String(transaction.type)
      )
    ) {
      balance -= amount;
    }
  }

  return balance;
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

    const withdrawals =
      await db.orm.public.Withdrawal.all();

    return NextResponse.json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    console.error(
      "ADMIN_WITHDRAWALS_GET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load withdrawals.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const withdrawalId = String(
      body.withdrawalId || ""
    ).trim();

    const action = String(
      body.action || ""
    )
      .trim()
      .toUpperCase();

    const rejectionReason = String(
      body.rejectionReason || ""
    ).trim();

    if (!withdrawalId) {
      return NextResponse.json(
        {
          error:
            "Withdrawal ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      action !== "APPROVE" &&
      action !== "REJECT"
    ) {
      return NextResponse.json(
        {
          error:
            "Action must be APPROVE or REJECT.",
        },
        { status: 400 }
      );
    }

    const withdrawal =
      await db.orm.public.Withdrawal
        .where((item) =>
          item.id.eq(withdrawalId)
        )
        .first();

    if (!withdrawal) {
      return NextResponse.json(
        {
          error: "Withdrawal not found.",
        },
        { status: 404 }
      );
    }

    if (withdrawal.status !== "PENDING") {
      return NextResponse.json(
        {
          error:
            "This withdrawal has already been processed.",
        },
        { status: 400 }
      );
    }

    if (action === "REJECT") {
      if (!rejectionReason) {
        return NextResponse.json(
          {
            error:
              "Rejection reason is required.",
          },
          { status: 400 }
        );
      }

      await db.orm.public.Withdrawal
        .where((item) =>
          item.id.eq(withdrawalId)
        )
        .update({
          status: "REJECTED",
          rejectedAt: new Date(),
          reviewedById: admin.id,
          rejectionReason,
        } as any);

      await db.orm.public.AuditLog.create({
        action: "WITHDRAWAL_REJECT",
        adminId: admin.id,
        targetUserId: withdrawal.userId,
        description:
          "Withdrawal rejected by administrator.",
        metadata: {
          withdrawalId,
          rejectionReason,
        },
      } as any);

      return NextResponse.json({
        success: true,
        message:
          "Withdrawal rejected successfully.",
      });
    }

    const userTransactions =
      await db.orm.public.Transaction
        .where((item) =>
          item.userId.eq(withdrawal.userId)
        )
        .all();

    const balance =
      calculateBalance(userTransactions);

    const requestedAmount = Number(
      withdrawal.amountUSD
    );

    const feeAmount = Number(
      withdrawal.feeUSD
    );

    const totalDeduction =
      requestedAmount + feeAmount;

    if (
      !Number.isFinite(requestedAmount) ||
      requestedAmount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid withdrawal amount.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(feeAmount) ||
      feeAmount < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid withdrawal fee.",
        },
        { status: 400 }
      );
    }

    if (balance < totalDeduction) {
      return NextResponse.json(
        {
          error:
            "User does not have enough available balance for this withdrawal.",
        },
        { status: 400 }
      );
    }

    const withdrawalReference =
      `WITHDRAWAL:${withdrawal.id}`;

    const feeReference =
      `WITHDRAWAL_FEE:${withdrawal.id}`;

    const existingWithdrawalTransaction =
      await db.orm.public.Transaction
        .where((item) =>
          item.referenceId.eq(
            withdrawalReference
          )
        )
        .first();

    const existingFeeTransaction =
      await db.orm.public.Transaction
        .where((item) =>
          item.referenceId.eq(
            feeReference
          )
        )
        .first();

    if (
      existingWithdrawalTransaction ||
      existingFeeTransaction
    ) {
      return NextResponse.json(
        {
          error:
            "Ledger entries already exist for this withdrawal.",
        },
        { status: 409 }
      );
    }

    const balanceAfterWithdrawal =
      balance - requestedAmount;

    const balanceAfterFee =
      balanceAfterWithdrawal - feeAmount;

    await db.orm.public.Transaction.create({
      userId: withdrawal.userId,
      type: "WITHDRAWAL",
      status: "COMPLETED",
      amountUSD: String(requestedAmount),
      balanceBefore: String(balance),
      balanceAfter: String(
        balanceAfterWithdrawal
      ),
      referenceId: withdrawalReference,
      description: "Withdrawal approved",
      withdrawalId: withdrawal.id,
    } as any);

    await db.orm.public.Transaction.create({
      userId: withdrawal.userId,
      type: "WITHDRAWAL_FEE",
      status: "COMPLETED",
      amountUSD: String(feeAmount),
      balanceBefore: String(
        balanceAfterWithdrawal
      ),
      balanceAfter: String(
        balanceAfterFee
      ),
      referenceId: feeReference,
      description:
        "Withdrawal processing fee",
      withdrawalId: withdrawal.id,
    } as any);

    await db.orm.public.Withdrawal
      .where((item) =>
        item.id.eq(withdrawalId)
      )
      .update({
        status: "APPROVED",
        approvedAt: new Date(),
        reviewedById: admin.id,
      } as any);

    await db.orm.public.AuditLog.create({
      action: "WITHDRAWAL_APPROVE",
      adminId: admin.id,
      targetUserId: withdrawal.userId,
      description:
        "Withdrawal approved by administrator.",
      metadata: {
        withdrawalId,
        withdrawalAmount: requestedAmount,
        feeAmount,
        balanceBefore: balance,
        balanceAfter: balanceAfterFee,
      },
    } as any);

    return NextResponse.json({
      success: true,
      message:
        "Withdrawal approved successfully.",
      balanceBefore: balance.toFixed(2),
      withdrawalAmount:
        requestedAmount.toFixed(2),
      feeAmount:
        feeAmount.toFixed(2),
      balanceAfter:
        balanceAfterFee.toFixed(2),
    });
  } catch (error) {
    console.error(
      "ADMIN_WITHDRAWALS_PATCH_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to process withdrawal.",
      },
      { status: 500 }
    );
  }
}