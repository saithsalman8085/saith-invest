import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

const CREDIT_TYPES = [
"DEPOSIT",
"DAILY_EARNING",
"REFERRAL_COMMISSION",
"ACTIVE_USER_REWARD",
];

const DEBIT_TYPES = [
"INVESTMENT",
"WITHDRAWAL",
"WITHDRAWAL_FEE",
];

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

const completedTransactions =
  transactions.filter(
    (transaction) =>
      transaction.status === "COMPLETED"
  );

let balance = 0;

for (const transaction of completedTransactions) {
  const amount = Number(
    transaction.amountUSD
  );

  if (!Number.isFinite(amount)) {
    continue;
  }

  if (
    CREDIT_TYPES.includes(
      String(transaction.type)
    )
  ) {
    balance += amount;
  }

  if (
    DEBIT_TYPES.includes(
      String(transaction.type)
    )
  ) {
    balance -= amount;
  }
}

return NextResponse.json({
  success: true,
  wallet: {
    balanceUSD: balance.toFixed(2),
  },
});


} catch (error) {
console.error(
"WALLET_ERROR:",
error
);


return NextResponse.json(
  {
    error:
      "Unable to load wallet balance.",
  },
  { status: 500 }
);


}
}
