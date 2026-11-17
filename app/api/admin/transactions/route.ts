
import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";

export async function GET() {
  try {
    const transactions = await db.orm.public.Transaction.all();

    const users = await db.orm.public.User.all();

    const userMap = new Map(
      users.map((user: any) => [user.id, user.publicUserId])
    );

    const formattedTransactions = transactions.map((transaction: any) => ({
      ...transaction,
      userId: userMap.get(transaction.userId) || transaction.userId,
    }));

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error("Transactions API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
