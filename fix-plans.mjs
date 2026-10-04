import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

try {
await sql`     ALTER TABLE "InvestmentPlan"
    ADD COLUMN IF NOT EXISTS "depositAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "profitAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "dailyEarning" DECIMAL(18,4) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "totalReturn" DECIMAL(18,2) NOT NULL DEFAULT 0;
  `;

await sql`     UPDATE "InvestmentPlan"
    SET
      "depositAmount" = COALESCE("minAmount", 0),
      "dailyEarning" = COALESCE("dailyReturn", 0),
      "totalReturn" = COALESCE("minAmount", 0) +
        (COALESCE("dailyReturn", 0) * "durationDays"),
      "profitAmount" =
        (COALESCE("dailyReturn", 0) * "durationDays");
  `;

console.log("InvestmentPlan columns added and existing plans updated.");
} finally {
await sql.end();
}
