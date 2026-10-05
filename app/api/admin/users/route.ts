import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/prisma";

import { requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const search =
      request.nextUrl.searchParams
        .get("search")
        ?.trim()
        .toLowerCase() || "";

    const users = await db.orm.public.User.all();

    const filteredUsers = search
      ? users.filter((user) => {
          const fullName = String(
            user.fullName || ""
          ).toLowerCase();

          const email = String(
            user.email || ""
          ).toLowerCase();

          const phone = String(
            user.phone || ""
          ).toLowerCase();

          const publicUserId = String(
            user.publicUserId || ""
          ).toLowerCase();

          const referralCode = String(
            user.referralCode || ""
          ).toLowerCase();

          return (
            fullName.includes(search) ||
            email.includes(search) ||
            phone.includes(search) ||
            publicUserId.includes(search) ||
            referralCode.includes(search)
          );
        })
      : users;

    return NextResponse.json({
      success: true,
      users: filteredUsers,
    });
  } catch (error) {
    console.error("ADMIN_USERS_GET_ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load users." },
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

    const userId = String(
      body.userId || ""
    ).trim();

    const action = String(
      body.action || ""
    )
      .trim()
      .toUpperCase();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    if (userId === admin.id) {
      return NextResponse.json(
        {
          error:
            "You cannot modify your own admin account.",
        },
        { status: 400 }
      );
    }

    const targetUser =
      await db.orm.public.User
        .where((user) => user.id.eq(userId))
        .first();

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    if (String(targetUser.role) === "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Admin accounts cannot be modified from user management.",
        },
        { status: 400 }
      );
    }

    /*
     * USER EDIT
     */
    if (action === "EDIT") {
      const fullName = String(
        body.fullName ?? ""
      ).trim();

      const emailRaw = String(
        body.email ?? ""
      ).trim();

      const phoneRaw = String(
        body.phone ?? ""
      ).trim();

      if (!fullName) {
        return NextResponse.json(
          { error: "Full name is required." },
          { status: 400 }
        );
      }

      if (fullName.length < 2 || fullName.length > 100) {
        return NextResponse.json(
          {
            error:
              "Full name must be between 2 and 100 characters.",
          },
          { status: 400 }
        );
      }

      const email =
        emailRaw.length > 0
          ? emailRaw.toLowerCase()
          : null;

      const phone =
        phoneRaw.length > 0
          ? phoneRaw
          : null;

      if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return NextResponse.json(
          { error: "Invalid email address." },
          { status: 400 }
        );
      }

      if (email) {
        const existingEmail =
          await db.orm.public.User
            .where((user) => user.email.eq(email))
            .first();

        if (
          existingEmail &&
          existingEmail.id !== userId
        ) {
          return NextResponse.json(
            {
              error:
                "This email is already used by another user.",
            },
            { status: 409 }
          );
        }
      }

      if (phone) {
        const existingPhone =
          await db.orm.public.User
            .where((user) => user.phone.eq(phone))
            .first();

        if (
          existingPhone &&
          existingPhone.id !== userId
        ) {
          return NextResponse.json(
            {
              error:
                "This phone number is already used by another user.",
            },
            { status: 409 }
          );
        }
      }

      const updatedUser =
        await db.orm.public.User
          .where((user) => user.id.eq(userId))
          .update({
            fullName,
            email,
            phone,
          } as any);

      await db.orm.public.AuditLog.create({
        action: "ADMIN_ADJUSTMENT",
        adminId: admin.id,
        targetUserId: userId,
        description:
          "User profile details updated by administrator.",
        metadata: {
          previousFullName: String(
            targetUser.fullName || ""
          ),
          previousEmail: String(
            targetUser.email || ""
          ),
          previousPhone: String(
            targetUser.phone || ""
          ),
          newFullName: fullName,
          newEmail: email,
          newPhone: phone,
        },
      } as any);

      return NextResponse.json({
        success: true,
        user: updatedUser,
        message: "User details updated successfully.",
      });
    }

    /*
     * ADMIN BONUS
     */
    if (action === "BONUS") {
      const amount = Number(body.amount);
      const message = String(
        body.message || ""
      ).trim();

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return NextResponse.json(
          { error: "Bonus amount must be greater than 0." },
          { status: 400 }
        );
      }

      const bonusAmount = Number(
        amount.toFixed(2)
      );

      if (bonusAmount <= 0) {
        return NextResponse.json(
          { error: "Invalid bonus amount." },
          { status: 400 }
        );
      }

      const transactions =
        await db.orm.public.Transaction
          .where((transaction) =>
            transaction.userId.eq(userId)
          )
          .all();

      let balance = 0;

      const creditTypes = [
        "DEPOSIT",
        "DAILY_EARNING",
        "REFERRAL_COMMISSION",
        "ACTIVE_USER_REWARD",
        "ADMIN_ADJUSTMENT",
      ];

      const debitTypes = [
        "INVESTMENT",
        "WITHDRAWAL",
        "WITHDRAWAL_FEE",
      ];

      for (const transaction of transactions) {
        if (transaction.status !== "COMPLETED") {
          continue;
        }

        const transactionAmount =
          Number(transaction.amountUSD);

        if (
          creditTypes.includes(
            transaction.type
          )
        ) {
          balance += transactionAmount;
        }

        if (
          debitTypes.includes(
            transaction.type
          )
        ) {
          balance -= transactionAmount;
        }
      }

      const balanceBefore = Number(
        balance.toFixed(2)
      );

      const balanceAfter = Number(
        (balanceBefore + bonusAmount).toFixed(2)
      );

      const transaction =
        await db.orm.public.Transaction.create({
          userId,
          type: "ADMIN_ADJUSTMENT",
          status: "COMPLETED",
          amountUSD: bonusAmount,
          balanceBefore,
          balanceAfter,
          referenceId: `ADMIN_BONUS_${Date.now()}_${userId}`,
          description:
            message ||
            "ClaudeInvest ki taraf se apko bonus mila hai.",
        } as any);

      await db.orm.public.AuditLog.create({
        action: "ADMIN_ADJUSTMENT",
        adminId: admin.id,
        targetUserId: userId,
        description:
          "Bonus sent to user by administrator.",
        metadata: {
          type: "BONUS",
          amountUSD: bonusAmount,
          message:
            message ||
            "ClaudeInvest ki taraf se apko bonus mila hai.",
          balanceBefore,
          balanceAfter,
          transactionId: transaction.id,
        },
      } as any);

      return NextResponse.json({
        success: true,
        message: "Bonus sent successfully.",
        transactionId: transaction.id,
        amountUSD: bonusAmount,
      });
    }

    /*
     * USER STATUS ACTION
     */
    if (
      !["SUSPEND", "ACTIVATE", "BLOCK"].includes(
        action
      )
    ) {
      return NextResponse.json(
        { error: "Invalid user action." },
        { status: 400 }
      );
    }

    let newStatus = "ACTIVE";
    let auditAction = "USER_ACTIVATE";
    let description = "User account activated.";

    if (action === "SUSPEND") {
      newStatus = "SUSPENDED";
      auditAction = "USER_SUSPEND";
      description = "User account suspended.";
    }

    if (action === "BLOCK") {
      newStatus = "BLOCKED";
      auditAction = "USER_SUSPEND";
      description = "User account blocked.";
    }

    const updatedUser =
      await db.orm.public.User
        .where((user) => user.id.eq(userId))
        .update({
          status: newStatus,
        } as any);

    await db.orm.public.AuditLog.create({
      action: auditAction,
      adminId: admin.id,
      targetUserId: userId,
      description,
      metadata: {
        previousStatus: String(
          targetUser.status
        ),
        newStatus,
        action,
      },
    } as any);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: description,
    });
  } catch (error) {
    console.error(
      "ADMIN_USERS_PATCH_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update user.",
      },
      { status: 400 }
    );
  }
}