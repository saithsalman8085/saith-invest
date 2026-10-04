import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const users = await db.orm.public.User.all();
    const deposits = await db.orm.public.Deposit.all();
    const withdrawals = await db.orm.public.Withdrawal.all();
    const plans = await db.orm.public.InvestmentPlan.all();

    const publishedPlans = plans.filter(
      (plan) => plan.status === "PUBLISHED"
    );

    const pendingDeposits = deposits.filter(
      (deposit) => deposit.status === "PENDING"
    );

    const pendingWithdrawals = withdrawals.filter(
      (withdrawal) => withdrawal.status === "PENDING"
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: users.length,
        activePlans: publishedPlans.length,
        pendingDeposits: pendingDeposits.length,
        pendingWithdrawals: pendingWithdrawals.length,
      },
    });
  } catch (error) {
    console.error("ADMIN_STATS_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load admin statistics." },
      { status: 500 }
    );
  }
}