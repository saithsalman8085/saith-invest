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

    // Current logged-in user
    const user = await db.orm.public.User
      .where((user) => user.id.eq(userId))
      .first();

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // LEVEL 1
    // Users directly referred by current user
    const level1Users = await db.orm.public.User
      .where((user) => user.referredById.eq(userId))
      .all();

    const level1Ids = level1Users.map((user) => user.id);

    // LEVEL 2
    // Users referred by Level 1 users
    let level2Users: typeof level1Users = [];

    if (level1Ids.length > 0) {
      const users = await db.orm.public.User.all();

      level2Users = users.filter(
        (user) =>
          user.referredById &&
          level1Ids.includes(user.referredById)
      );
    }

    const level2Ids = level2Users.map((user) => user.id);

    // LEVEL 3
    // Users referred by Level 2 users
    let level3Users: typeof level1Users = [];

    if (level2Ids.length > 0) {
      const users = await db.orm.public.User.all();

      level3Users = users.filter(
        (user) =>
          user.referredById &&
          level2Ids.includes(user.referredById)
      );
    }

    const allReferralUsers = [
      ...level1Users,
      ...level2Users,
      ...level3Users,
    ];

    // Active users in the 3-level network
    const activeUsers = allReferralUsers.filter(
      (user) => user.status === "ACTIVE"
    ).length;

    // Referral earnings
    const commissions = await db.orm.public.ReferralCommission
      .where((commission) => commission.beneficiaryId.eq(userId))
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
        totalInvites: level1Users.length,
        activeUsers,
        referralEarnings: Number(referralEarnings.toFixed(2)),
        totalNetwork: allReferralUsers.length,
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