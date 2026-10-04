import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

await sql.unsafe(`
  ALTER TABLE "InvestmentPlan"
  DROP COLUMN IF EXISTS "minAmount",
  DROP COLUMN IF EXISTS "maxAmount";
`);

console.log("Old minAmount and maxAmount columns removed successfully.");

await sql.end();