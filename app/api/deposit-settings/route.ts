import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
try {
const settings =
await db.orm.public.PlatformSettings.first();


if (!settings) {
  return NextResponse.json({
    success: true,
    settings: {
      paymentMethod: "Easypaisa",
      accountName: "ClaudeInvest",
      accountNumber: "",
      instructions:
        "Send payment to the account above and enter your transaction ID.",
      exchangeRate: "300",
    },
  });
}

return NextResponse.json({
  success: true,
  settings: {
    paymentMethod:
      settings.depositPaymentMethod,
    accountName:
      settings.depositAccountName,
    accountNumber:
      settings.depositAccountNumber,
    instructions:
      settings.depositInstructions,
    exchangeRate:
      String(settings.exchangeRate),
  },
});


} catch (error) {
console.error(
"PUBLIC_DEPOSIT_SETTINGS_ERROR:",
error
);


return NextResponse.json(
  {
    error:
      "Unable to load deposit payment details.",
  },
  { status: 500 }
);


}
}
