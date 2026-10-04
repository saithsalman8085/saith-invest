import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";

export async function GET() {
  try {
    const transactions = await db.orm.public.Transaction.all();

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Transactions API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}