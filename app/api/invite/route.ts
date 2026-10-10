
import { NextResponse } from "next/server";
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

    const user = await db.orm.public.User
      .where((user) => user.id.eq(userId))
      .first();

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // LEVEL 1: Direct referrals
    const level1Users = await db.orm.public.User
      .where((user) => user.referredById.eq(userId))
      .all();

    const level1Ids = level1Users.map((user) => user.id);

    // LEVEL 2: Referrals invited by Level 1
    let level2Users: typeof level1Users = [];

    if (level1Ids.length > 0) {
      const allUsers = await db.orm.public.User.all();

      level2Users = allUsers.filter(
        (referralUser) =>
          referralUser.referredById &&
          level1Ids.includes(referralUser.referredById)
      );
    }

    const level2Ids = level2Users.map((user) => user.id);

    // LEVEL 3: Referrals invited by Level 2
    let level3Users: typeof level1Users = [];

    if (level2Ids.length > 0) {
      const allUsers = await db.orm.public.User.all();

      level3Users = allUsers.filter(
        (referralUser) =>
          referralUser.referredById &&
          level2Ids.includes(referralUser.referredById)
      );
    }

    // All referrals across the three levels
    const allReferralUsers = [
      ...level1Users,
      ...level2Users,
      ...level3Users,
    ];

    // Count each referred user only once
    const uniqueReferralUsers = Array.from(
      new Map(
        allReferralUsers.map((referralUser) => [
          referralUser.id,
          referralUser,
        ])
      ).values()
    );

    // Total Invites includes all referred users,
    // whether or not they purchased a plan
    const totalInvites = uniqueReferralUsers.length;

    // Active Users includes referrals with at least
    // one investment that has not been cancelled
    const allInvestments = await db.orm.public.Investment.all();

    const usersWithInvestments = new Set(
      allInvestments
        .filter(
          (investment) =>
            String(investment.status) !== "CANCELLED"
        )
        .map((investment) => investment.userId)
    );

    const activeUsers = uniqueReferralUsers.filter(
      (referralUser) => usersWithInvestments.has(referralUser.id)
    ).length;

    // Referral earnings: existing calculation unchanged
    const commissions = await db.orm.public.ReferralCommission
      .where((commission) =>
        commission.beneficiaryId.eq(userId)
      )
      .all();

    const referralEarnings = commissions.reduce(
      (total, commission) =>
        total + Number(commission.commissionAmount || 0),
      0
    );

    return NextResponse.json({
      success: true,

      user: {
        referralCode: user.referralCode,
      },

      stats: {
        totalInvites,
        activeUsers,
        referralEarnings: Number(referralEarnings.toFixed(2)),
        totalNetwork: totalInvites,
      },

      levels: {
        level1: level1Users.length,
        level2: level2Users.length,
        level3: level3Users.length,
      },
    });
  } catch (error) {
    console.error("REFERRALS_GET_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load referral data." },
      { status: 500 }
    );
  }
}