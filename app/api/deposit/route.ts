import { NextRequest, NextResponse } from "next/server";
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

    const deposits =
      await db.orm.public.Deposit
        .where((deposit) =>
          deposit.userId.eq(userId)
        )
        .all();

    const sortedDeposits = [...deposits]
      .sort(
        (a, b) =>
          new Date(String(b.submittedAt)).getTime() -
          new Date(String(a.submittedAt)).getTime()
      )
      .map((deposit) => ({
        id: deposit.id,
        amountPKR: String(deposit.amountPKR),
        exchangeRate: String(deposit.exchangeRate),
        creditAmountUSD: String(deposit.creditAmountUSD),
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
      }));

    return NextResponse.json({
      success: true,
      deposits: sortedDeposits,
    });
  } catch (error) {
    console.error(
      "DEPOSIT_GET_ERROR:",
      error instanceof Error
        ? error.stack
        : JSON.stringify(error, null, 2)
    );

    return NextResponse.json(
      {
        error: "Unable to load deposit history.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
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

    const amountPKR = Number(
      body.amountPKR
    );

    const transactionId = String(
      body.transactionId || ""
    ).trim();

    if (
      !Number.isFinite(amountPKR) ||
      amountPKR <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid deposit amount.",
        },
        { status: 400 }
      );
    }

    if (!transactionId) {
      return NextResponse.json(
        {
          error:
            "Transaction ID is required.",
        },
        { status: 400 }
      );
    }

    const settings =
      await db.orm.public.PlatformSettings.first();

    const paymentMethod =
      settings?.depositPaymentMethod ||
      "Easypaisa";

    const exchangeRate = Number(
      settings?.exchangeRate || 300
    );

    if (
      !Number.isFinite(exchangeRate) ||
      exchangeRate <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Deposit exchange rate is not configured correctly.",
        },
        { status: 500 }
      );
    }

    const existingDeposit =
      await db.orm.public.Deposit
        .where((deposit) =>
          deposit.transactionId.eq(
            transactionId
          )
        )
        .first();

    if (existingDeposit) {
      return NextResponse.json(
        {
          error:
            "This transaction ID has already been submitted.",
        },
        { status: 409 }
      );
    }

    const creditAmountUSD =
      amountPKR / exchangeRate;

    const deposit =
      await db.orm.public.Deposit.create({
        userId,
        amountPKR: String(amountPKR),
        exchangeRate: String(exchangeRate),
        creditAmountUSD:
          String(creditAmountUSD),
        paymentMethod,
        transactionId,
        status: "PENDING",
      } as any);

    return NextResponse.json(
      {
        success: true,
        deposit: {
          id: deposit.id,
          amountPKR:
            String(deposit.amountPKR),
          creditAmountUSD:
            String(deposit.creditAmountUSD),
          paymentMethod:
            deposit.paymentMethod,
          transactionId:
            deposit.transactionId,
          status: deposit.status,
          submittedAt:
            String(deposit.submittedAt),
        },
        message:
          "Deposit submitted successfully and is pending admin approval.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "DEPOSIT_POST_ERROR:",
      error instanceof Error
        ? error.stack
        : JSON.stringify(error, null, 2)
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to submit deposit.",
      },
      { status: 500 }
    );
  }
}