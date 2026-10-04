import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import "temporal-polyfill/full/global";
import { Temporal } from "temporal-polyfill";

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const deposits =
      await db.orm.public.Deposit.all();

    const sorted = [...deposits]
      .sort(
        (a, b) =>
          new Date(String(b.submittedAt)).getTime() -
          new Date(String(a.submittedAt)).getTime()
      )
      .map((deposit) => ({
        id: deposit.id,
        userId: deposit.userId,
        amountPKR: String(deposit.amountPKR),
        exchangeRate: String(deposit.exchangeRate),
        creditAmountUSD:
          String(deposit.creditAmountUSD),
        paymentMethod: deposit.paymentMethod,
        transactionId: deposit.transactionId,
        status: deposit.status,
        submittedAt: String(deposit.submittedAt),
        approvedAt: deposit.approvedAt
          ? String(deposit.approvedAt)
          : null,
        rejectedAt: deposit.rejectedAt
          ? String(deposit.rejectedAt)
          : null,
        rejectionReason:
          deposit.rejectionReason || null,
        reviewedById:
          deposit.reviewedById || null,
      }));

    return NextResponse.json({
      deposits: sorted,
    });
  } catch (error) {
    console.error(
      "ADMIN_DEPOSIT_GET_ERROR:",
      error instanceof Error
        ? error.stack
        : JSON.stringify(error, null, 2)
    );

    return NextResponse.json(
      {
        error: "Unable to load deposits.",
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

    const rawBody = await request.text();

    if (!rawBody.trim()) {
      return NextResponse.json(
        { error: "Request body is empty." },
        { status: 400 }
      );
    }

    let body: any;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const depositId = String(
      body.depositId || ""
    ).trim();

    const action = String(
      body.action || ""
    )
      .trim()
      .toUpperCase();

    const rejectionReason = String(
      body.rejectionReason || ""
    ).trim();

    if (!depositId) {
      return NextResponse.json(
        { error: "Deposit ID is required." },
        { status: 400 }
      );
    }

    if (
      !["APPROVE", "REJECT"].includes(action)
    ) {
      return NextResponse.json(
        { error: "Invalid deposit action." },
        { status: 400 }
      );
    }

    const deposit =
      await db.orm.public.Deposit
        .where((item) =>
          item.id.eq(depositId)
        )
        .first();

    if (!deposit) {
      return NextResponse.json(
        { error: "Deposit not found." },
        { status: 404 }
      );
    }

    if (deposit.status !== "PENDING") {
      return NextResponse.json(
        {
          error:
            "This deposit has already been reviewed.",
        },
        { status: 400 }
      );
    }

    if (action === "REJECT") {
      const finalReason =
        rejectionReason ||
        "Deposit rejected by admin.";

      await db.orm.public.Deposit
        .where((item) =>
          item.id.eq(depositId)
        )
        .update({
          status: "REJECTED",
          rejectedAt:
            Temporal.PlainDateTime.from(
              new Date()
                .toISOString()
                .slice(0, 19)
            ),
          rejectionReason: finalReason,
          reviewedById: admin.id,
        } as any);

      await db.orm.public.AuditLog.create({
        action: "DEPOSIT_REJECT",
        adminId: admin.id,
        targetUserId: deposit.userId,
        description:
          "Deposit rejected by administrator.",
        metadata: {
          depositId,
          rejectionReason: finalReason,
        },
      } as any);

      return NextResponse.json({
        success: true,
        message:
          "Deposit rejected successfully.",
      });
    }

    const existingTransaction =
      await db.orm.public.Transaction
        .where((item) =>
          item.referenceId.eq(
            `DEPOSIT:${deposit.id}`
          )
        )
        .first();

    if (existingTransaction) {
      return NextResponse.json(
        {
          error:
            "This deposit has already been credited.",
        },
        { status: 400 }
      );
    }

    const userTransactions =
      await db.orm.public.Transaction
        .where((item) =>
          item.userId.eq(deposit.userId)
        )
        .all();

    const creditTypes = new Set([
      "DEPOSIT",
      "DAILY_EARNING",
      "REFERRAL_COMMISSION",
      "ACTIVE_USER_REWARD",
    ]);

    const debitTypes = new Set([
      "INVESTMENT",
      "WITHDRAWAL",
      "WITHDRAWAL_FEE",
    ]);

    let balance = 0;

    for (const transaction of userTransactions) {
      const amount = Number(
        transaction.amountUSD || 0
      );

      if (creditTypes.has(transaction.type)) {
        balance += amount;
      }

      if (debitTypes.has(transaction.type)) {
        balance -= amount;
      }
    }

    const creditAmount = Number(
      deposit.creditAmountUSD || 0
    );

    if (
      !Number.isFinite(creditAmount) ||
      creditAmount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid deposit credit amount.",
        },
        { status: 400 }
      );
    }

    const newBalance =
      balance + creditAmount;

    await db.orm.public.Transaction.create({
      userId: deposit.userId,
      type: "DEPOSIT",
      status: "COMPLETED",
      amountUSD: String(creditAmount),
      balanceBefore: String(balance),
      balanceAfter: String(newBalance),
      referenceId:
        `DEPOSIT:${deposit.id}`,
      description:
        `Deposit approved - ${deposit.paymentMethod}`,
      depositId: deposit.id,
    } as any);

    await db.orm.public.Deposit
      .where((item) =>
        item.id.eq(depositId)
      )
      .update({
        status: "APPROVED",
        approvedAt:
          Temporal.PlainDateTime.from(
            new Date()
              .toISOString()
              .slice(0, 19)
          ),
        reviewedById: admin.id,
      } as any);

    await db.orm.public.AuditLog.create({
      action: "DEPOSIT_APPROVE",
      adminId: admin.id,
      targetUserId: deposit.userId,
      description:
        "Deposit approved and wallet credited.",
      metadata: {
        depositId,
        creditedUSD: creditAmount,
        balanceBefore: balance,
        balanceAfter: newBalance,
      },
    } as any);

    return NextResponse.json({
      success: true,
      message:
        "Deposit approved and wallet credited.",
      creditedUSD: creditAmount,
      balanceAfter: newBalance,
    });
  } catch (error) {
    console.error(
      "ADMIN_DEPOSIT_PATCH_ERROR:",
      error instanceof Error
        ? error.stack
        : JSON.stringify(error, null, 2)
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to process deposit.",
      },
      { status: 500 }
    );
  }
}