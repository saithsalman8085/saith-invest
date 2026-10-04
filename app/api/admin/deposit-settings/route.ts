import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

async function getSettings() {
  let settings =
    await db.orm.public.PlatformSettings.first();

  if (!settings) {
    settings =
      await db.orm.public.PlatformSettings.create({
        platformName: "ClaudeInvest",
        platformCurrency: "USD",
        depositCurrency: "PKR",
        withdrawalCurrency: "PKR",
        exchangeRate: "300",
        withdrawalFeePercent: "8",
        depositPaymentMethod: "Easypaisa",
        depositAccountName: "ClaudeInvest",
        depositAccountNumber: "",
        depositInstructions:
          "Send payment to the account above and enter your transaction ID.",
        depositApprovalMinHours: 1,
        depositApprovalMaxHours: 3,
        withdrawalApprovalMaxHours: 2,
        withdrawalMonday: true,
        withdrawalTuesday: true,
        withdrawalWednesday: true,
        withdrawalThursday: true,
        withdrawalFriday: true,
        withdrawalSaturday: false,
        withdrawalSunday: false,
        withdrawalOpeningHour: 9,
        withdrawalClosingHour: 23,
        maintenanceMode: false,
        adminTwoFactor: false,
      } as any);
  }

  return settings;
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

    const settings = await getSettings();

    return NextResponse.json({
      settings: {
        depositPaymentMethod:
          settings.depositPaymentMethod,

        depositAccountName:
          settings.depositAccountName,

        depositAccountNumber:
          settings.depositAccountNumber,

        depositInstructions:
          settings.depositInstructions,

        exchangeRate:
          String(settings.exchangeRate),

        depositApprovalMinHours:
          settings.depositApprovalMinHours,

        depositApprovalMaxHours:
          settings.depositApprovalMaxHours,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN_DEPOSIT_SETTINGS_GET_ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load deposit settings." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const depositPaymentMethod = String(
      body.depositPaymentMethod || ""
    ).trim();

    const depositAccountName = String(
      body.depositAccountName || ""
    ).trim();

    const depositAccountNumber = String(
      body.depositAccountNumber || ""
    ).trim();

    const depositInstructions = String(
      body.depositInstructions || ""
    ).trim();

    if (!depositPaymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required." },
        { status: 400 }
      );
    }

    if (!depositAccountName) {
      return NextResponse.json(
        { error: "Account name is required." },
        { status: 400 }
      );
    }

    if (!depositAccountNumber) {
      return NextResponse.json(
        { error: "Account number is required." },
        { status: 400 }
      );
    }

    if (!depositInstructions) {
      return NextResponse.json(
        {
          error:
            "Deposit instructions are required.",
        },
        { status: 400 }
      );
    }

    const settings = await getSettings();

    await db.orm.public.PlatformSettings
      .where((item) => item.id.eq(settings.id))
      .update({
        depositPaymentMethod,
        depositAccountName,
        depositAccountNumber,
        depositInstructions,
      } as any);

    return NextResponse.json({
      success: true,
      message:
        "Deposit settings updated successfully.",
      settings: {
        depositPaymentMethod,
        depositAccountName,
        depositAccountNumber,
        depositInstructions,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN_DEPOSIT_SETTINGS_PATCH_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update deposit settings.",
      },
      { status: 500 }
    );
  }
}