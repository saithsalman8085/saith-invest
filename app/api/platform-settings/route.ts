import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const settings =
      await db.orm.public.PlatformSettings.first();

    if (!settings) {
      return NextResponse.json({
        success: true,
        settings: {
          exchangeRate: 300,
          withdrawalFee: 8,
          withdrawalApprovalTime: 2,
          withdrawalStartTime: "09:00",
          withdrawalEndTime: "23:00",
          withdrawalMonday: true,
          withdrawalTuesday: true,
          withdrawalWednesday: true,
          withdrawalThursday: true,
          withdrawalFriday: true,
          withdrawalSaturday: false,
          withdrawalSunday: false,
          maintenanceMode: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        exchangeRate: Number(settings.exchangeRate),
        withdrawalFee: Number(
          settings.withdrawalFeePercent
        ),

        withdrawalApprovalTime:
          Number(
            settings.withdrawalApprovalMaxHours
          ),

        withdrawalStartTime:
          `${String(
            settings.withdrawalOpeningHour
          ).padStart(2, "0")}:00`,

        withdrawalEndTime:
          `${String(
            settings.withdrawalClosingHour
          ).padStart(2, "0")}:00`,

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
      },
    });
  } catch (error) {
    console.error(
      "PLATFORM_SETTINGS_GET_ERROR:",
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