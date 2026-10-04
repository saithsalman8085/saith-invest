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

const transactions =
  await db.orm.public.Transaction
    .where((transaction) =>
      transaction.userId.eq(userId)
    )
    .all();

const sortedTransactions = [...transactions].sort(
  (a, b) =>
    Number(b.createdAt) -
    Number(a.createdAt)
);

const formattedTransactions =
  sortedTransactions.map((transaction) => ({
    id: transaction.id,
    type: transaction.type,
    status: transaction.status,
    amountUSD: String(
      transaction.amountUSD
    ),
    balanceBefore: String(
      transaction.balanceBefore
    ),
    balanceAfter: String(
      transaction.balanceAfter
    ),
    referenceId:
      transaction.referenceId,
    description:
      transaction.description,
    createdAt:
      transaction.createdAt,
  }));

return NextResponse.json({
  success: true,
  transactions: formattedTransactions,
});


} catch (error) {
console.error(
"TRANSACTIONS_ERROR:",
error
);


return NextResponse.json(
  {
    error:
      "Unable to load transaction history.",
  },
  { status: 500 }
);


}
}
