import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
try {
const plans = await db.orm.public.InvestmentPlan
.where((plan) => plan.status.eq("PUBLISHED"))
.all();


return NextResponse.json({
  success: true,
  plans,
});


} catch (error) {
console.error("PUBLIC_PLANS_GET_ERROR:", error);


return NextResponse.json(
  {
    error: "Unable to load investment plans.",
  },
  { status: 500 }
);


}
}
