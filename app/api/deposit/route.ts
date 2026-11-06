
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

async function uploadScreenshot(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "claudeinvest/deposits",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error || new Error("Screenshot upload failed."));
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}

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
        .where((deposit) => deposit.userId.eq(userId))
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
        rejectionReason: deposit.rejectionReason || null,
      }));

    return NextResponse.json({
      success: true,
      deposits: sortedDeposits,
    });
  } catch (error) {
    console.error("DEPOSIT_GET_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load deposit history." },
      { status: 500 }
    );
  }
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

    const body = await request.formData();

    const amountPKR = Number(body.get("amountPKR"));
    const screenshot = body.get("screenshot");

    if (!Number.isFinite(amountPKR) || amountPKR <= 0) {
      return NextResponse.json(
        { error: "Please enter a valid deposit amount." },
        { status: 400 }
      );
    }

    if (!(screenshot instanceof File) || screenshot.size === 0) {
      return NextResponse.json(
        { error: "Payment screenshot is required." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(screenshot.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG and WEBP images are allowed." },
        { status: 400 }
      );
    }

    if (screenshot.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Screenshot must not exceed 5 MB." },
        { status: 400 }
      );
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: "Screenshot upload is not configured." },
        { status: 500 }
      );
    }

    const settings =
      await db.orm.public.PlatformSettings.first();

    const paymentMethod =
      settings?.depositPaymentMethod || "Easypaisa";

    const exchangeRate = Number(settings?.exchangeRate || 300);

    if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
      return NextResponse.json(
        {
          error:
            "Deposit exchange rate is not configured correctly.",
        },
        { status: 500 }
      );
    }

    // Upload screenshot to Cloudinary.
    const screenshotUrl = await uploadScreenshot(screenshot);

    const creditAmountUSD = amountPKR / exchangeRate;

    const deposit = await db.orm.public.Deposit.create({
      userId,
      amountPKR: String(amountPKR),
      exchangeRate: String(exchangeRate),
      creditAmountUSD: String(creditAmountUSD),
      paymentMethod,
      screenshotUrl,
      transactionId: null,
      status: "PENDING",
    } as any);

    return NextResponse.json(
      {
        success: true,
        deposit: {
          id: deposit.id,
          amountPKR: String(deposit.amountPKR),
          creditAmountUSD: String(deposit.creditAmountUSD),
          paymentMethod: deposit.paymentMethod,
          status: deposit.status,
          submittedAt: String(deposit.submittedAt),
        },
        message:
          "Deposit submitted successfully and is pending admin approval.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("DEPOSIT_POST_ERROR:", error);

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
