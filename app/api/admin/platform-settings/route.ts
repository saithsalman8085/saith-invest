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
        supportEmail: null,

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

function formatHour(hour: unknown) {
  const value = Number(hour);

  if (
    !Number.isInteger(value) ||
    value < 0 ||
    value > 23
  ) {
    return "00:00";
  }

  return `${String(value).padStart(2, "0")}:00`;
}

function numberValue(value: unknown) {
  const result = Number(value);

  return Number.isFinite(result) ? result : 0;
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
      success: true,

      settings: {
        platformName:
          settings.platformName,

        supportEmail:
          settings.supportEmail || "",

        platformCurrency:
          settings.platformCurrency,

        depositCurrency:
          settings.depositCurrency,

        withdrawalCurrency:
          settings.withdrawalCurrency,

        exchangeRate:
          String(settings.exchangeRate),

        withdrawalFee:
          String(settings.withdrawalFeePercent),

        depositPaymentMethod:
          settings.depositPaymentMethod,

        depositAccountName:
          settings.depositAccountName,

        depositAccountNumber:
          settings.depositAccountNumber,

        depositInstructions:
          settings.depositInstructions,

        depositMinApproval:
          Number(
            settings.depositApprovalMinHours
          ),

        depositMaxApproval:
          Number(
            settings.depositApprovalMaxHours
          ),

        withdrawalApprovalTime:
          Number(
            settings.withdrawalApprovalMaxHours
          ),

        withdrawalStartTime:
          formatHour(
            settings.withdrawalOpeningHour
          ),

        withdrawalEndTime:
          formatHour(
            settings.withdrawalClosingHour
          ),

        withdrawalMonday:
          Boolean(settings.withdrawalMonday),

        withdrawalTuesday:
          Boolean(settings.withdrawalTuesday),

        withdrawalWednesday:
          Boolean(settings.withdrawalWednesday),

        withdrawalThursday:
          Boolean(settings.withdrawalThursday),

        withdrawalFriday:
          Boolean(settings.withdrawalFriday),

        withdrawalSaturday:
          Boolean(settings.withdrawalSaturday),

        withdrawalSunday:
          Boolean(settings.withdrawalSunday),

        maintenanceMode:
          Boolean(settings.maintenanceMode),

        twoFactor:
          Boolean(settings.adminTwoFactor),
      },
    });
  } catch (error) {
    console.error(
      "ADMIN_PLATFORM_SETTINGS_GET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load platform settings.",
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

    const settings = await getSettings();

    const updates: Record<string, unknown> = {};

    // GENERAL

    if (body.platformName !== undefined) {
      const value =
        String(body.platformName).trim();

      if (!value) {
        return NextResponse.json(
          {
            error:
              "Platform name is required.",
          },
          { status: 400 }
        );
      }

      updates.platformName = value;
    }

    if (body.supportEmail !== undefined) {
      updates.supportEmail =
        String(body.supportEmail).trim() || null;
    }

    // CURRENCY

    if (body.exchangeRate !== undefined) {
      const value =
        numberValue(body.exchangeRate);

      if (value <= 0) {
        return NextResponse.json(
          {
            error:
              "Exchange rate must be greater than 0.",
          },
          { status: 400 }
        );
      }

      updates.exchangeRate =
        value.toFixed(4);
    }

    // WITHDRAWAL FEE

    if (body.withdrawalFee !== undefined) {
      const value =
        numberValue(body.withdrawalFee);

      if (value < 0 || value > 100) {
        return NextResponse.json(
          {
            error:
              "Withdrawal fee must be between 0% and 100%.",
          },
          { status: 400 }
        );
      }

      updates.withdrawalFeePercent =
        value.toFixed(4);
    }

    // DEPOSIT

    if (
      body.depositPaymentMethod !== undefined
    ) {
      updates.depositPaymentMethod =
        String(
          body.depositPaymentMethod
        ).trim();
    }

    if (
      body.depositAccountName !== undefined
    ) {
      updates.depositAccountName =
        String(
          body.depositAccountName
        ).trim();
    }

    if (
      body.depositAccountNumber !== undefined
    ) {
      updates.depositAccountNumber =
        String(
          body.depositAccountNumber
        ).trim();
    }

    if (
      body.depositInstructions !== undefined
    ) {
      updates.depositInstructions =
        String(
          body.depositInstructions
        ).trim();
    }

    if (
      body.depositMinApproval !== undefined
    ) {
      const value =
        Number(body.depositMinApproval);

      if (
        !Number.isInteger(value) ||
        value < 0
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid minimum deposit approval time.",
          },
          { status: 400 }
        );
      }

      updates.depositApprovalMinHours =
        value;
    }

    if (
      body.depositMaxApproval !== undefined
    ) {
      const value =
        Number(body.depositMaxApproval);

      if (
        !Number.isInteger(value) ||
        value < 0
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid maximum deposit approval time.",
          },
          { status: 400 }
        );
      }

      updates.depositApprovalMaxHours =
        value;
    }

    // WITHDRAWAL APPROVAL

    if (
      body.withdrawalApprovalTime !== undefined
    ) {
      const value =
        Number(body.withdrawalApprovalTime);

      if (
        !Number.isInteger(value) ||
        value < 0
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid withdrawal approval time.",
          },
          { status: 400 }
        );
      }

      updates.withdrawalApprovalMaxHours =
        value;
    }

    // WITHDRAWAL OPENING TIME

    if (
      body.withdrawalStartTime !== undefined
    ) {
      const value =
        String(body.withdrawalStartTime);

      const parts = value.split(":");
      const hour = Number(parts[0]);
      const minute = Number(parts[1] || 0);

      if (
        !Number.isInteger(hour) ||
        !Number.isInteger(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid withdrawal opening time.",
          },
          { status: 400 }
        );
      }

      // Current database stores hours only.
      updates.withdrawalOpeningHour =
        hour;
    }

    // WITHDRAWAL CLOSING TIME

    if (
      body.withdrawalEndTime !== undefined
    ) {
      const value =
        String(body.withdrawalEndTime);

      const parts = value.split(":");
      const hour = Number(parts[0]);
      const minute = Number(parts[1] || 0);

      if (
        !Number.isInteger(hour) ||
        !Number.isInteger(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid withdrawal closing time.",
          },
          { status: 400 }
        );
      }

      updates.withdrawalClosingHour =
        hour;
    }

    // WITHDRAWAL DAYS

    const withdrawalDays = [
      "withdrawalMonday",
      "withdrawalTuesday",
      "withdrawalWednesday",
      "withdrawalThursday",
      "withdrawalFriday",
      "withdrawalSaturday",
      "withdrawalSunday",
    ];

    for (const day of withdrawalDays) {
      if (body[day] !== undefined) {
        updates[day] =
          Boolean(body[day]);
      }
    }

    // SECURITY

    if (
      body.maintenanceMode !== undefined
    ) {
      updates.maintenanceMode =
        Boolean(body.maintenanceMode);
    }

    if (
      body.twoFactor !== undefined
    ) {
      updates.adminTwoFactor =
        Boolean(body.twoFactor);
    }

    if (
      Object.keys(updates).length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No settings were provided.",
        },
        { status: 400 }
      );
    }

    // SAVE TO DATABASE

    await db.orm.public.PlatformSettings
      .where((item) =>
        item.id.eq(settings.id)
      )
      .update(updates as any);

    // READ AGAIN FROM DATABASE
    // This confirms the actual saved values.

    const updatedSettings =
      await db.orm.public.PlatformSettings
        .where((item) =>
          item.id.eq(settings.id)
        )
        .first();

    if (!updatedSettings) {
      return NextResponse.json(
        {
          error:
            "Settings were updated but could not be verified.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Platform settings updated successfully.",

      settings: {
        exchangeRate:
          String(
            updatedSettings.exchangeRate
          ),

        withdrawalFee:
          String(
            updatedSettings.withdrawalFeePercent
          ),

        maintenanceMode:
          Boolean(
            updatedSettings.maintenanceMode
          ),

        withdrawalStartTime:
          formatHour(
            updatedSettings.withdrawalOpeningHour
          ),

        withdrawalEndTime:
          formatHour(
            updatedSettings.withdrawalClosingHour
          ),

        withdrawalApprovalTime:
          Number(
            updatedSettings.withdrawalApprovalMaxHours
          ),
      },
    });
  } catch (error) {
    console.error(
      "ADMIN_PLATFORM_SETTINGS_PATCH_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update platform settings.",
      },
      { status: 500 }
    );
  }
}