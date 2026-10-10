
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin access required." },
        { status: 403 }
      );
    }

    const search = (
      request.nextUrl.searchParams.get("userId") || ""
    ).trim().toLowerCase();

    if (!search) {
      return NextResponse.json(
        { success: false, error: "Please enter a user ID." },
        { status: 400 }
      );
    }

    const allUsers = await db.orm.public.User.all();

    const targetUser = allUsers.find(
      (user) =>
        String(user.publicUserId).toLowerCase() === search ||
        String(user.id).toLowerCase() === search
    );

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    // Level 1: Direct referrals
    const level1 = allUsers.filter(
      (user) => user.referredById === targetUser.id
    );

    const level1Ids = new Set(level1.map((user) => user.id));

    // Level 2: Referrals of Level 1 users
    const level2 = allUsers.filter(
      (user) => user.referredById && level1Ids.has(user.referredById)
    );

    const level2Ids = new Set(level2.map((user) => user.id));

    // Level 3: Referrals of Level 2 users
    const level3 = allUsers.filter(
      (user) => user.referredById && level2Ids.has(user.referredById)
    );

    // Combine levels and remove duplicate users
    const networkMap = new Map<
      string,
      (typeof allUsers)[number]
    >();

    for (const user of [...level1, ...level2, ...level3]) {
      networkMap.set(user.id, user);
    }

    const networkUsers = [...networkMap.values()];

    // A user is active if they have at least one non-cancelled investment
    const allInvestments = await db.orm.public.Investment.all();

    const usersWithInvestment = new Set(
      allInvestments
        .filter(
          (investment) =>
            String(investment.status).toUpperCase() !== "CANCELLED"
        )
        .map((investment) => investment.userId)
    );

    const activeUsers = networkUsers.filter((user) =>
      usersWithInvestment.has(user.id)
    ).length;

    const formatReferral = (
      user: (typeof allUsers)[number]
    ) => ({
      id: user.id,
      publicUserId: user.publicUserId,
      fullName: user.fullName,
      status: user.status,
      hasInvestment: usersWithInvestment.has(user.id),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: targetUser.id,
        publicUserId: targetUser.publicUserId,
        fullName: targetUser.fullName,
        referralCode: targetUser.referralCode,
      },
      stats: {
        totalUsersBelow: networkUsers.length,
        totalInvites: level1.length,
        totalActiveUsers: activeUsers,
      },
      levels: {
        level1: level1.map(formatReferral),
        level2: level2.map(formatReferral),
        level3: level3.map(formatReferral),
      },
    });
  } catch (error) {
    console.error("Active user history API error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to load active user history." },
      { status: 500 }
    );
  }
}