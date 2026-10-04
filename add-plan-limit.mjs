import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

await sql.unsafe(`
  ALTER TABLE "InvestmentPlan"
  ADD COLUMN IF NOT EXISTS "referralBonusUSD" DECIMAL(18, 2) NOT NULL DEFAULT 0;
`);

console.log("referralBonusUSD added successfully.");

await sql.end();