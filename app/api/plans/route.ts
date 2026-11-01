
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { Temporal } from "temporal-polyfill";

export async function GET() {
  try {
    const plans = await db.orm.public.InvestmentPlan
      .where((plan) => plan.status.eq("PUBLISHED"))
      .all();

    const now = Date.now();

    // Hide expired Limited Time plans from users.
    const availablePlans = plans.filter((plan) => {
      const category = String(
        plan.category ?? (plan.isSpecial ? "PREMIUM" : "NORMAL")
      );

      if (category !== "LIMITED_TIME") {
        return true;
      }

      if (!plan.expiresAt) {
        return false;
      }

      return Temporal.PlainDateTime.compare(
  plan.expiresAt,
  Temporal.Now.plainDateTimeISO("Asia/Karachi")
) > 0;
    });

    return NextResponse.json({
      success: true,
      plans: availablePlans,
    });
  } catch (error) {
    console.error("PUBLIC_PLANS_GET_ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to load investment plans.",
      },
      { status: 500 }
    );
  }
}
