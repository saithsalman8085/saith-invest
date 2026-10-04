import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

const columns = await sql`  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'PlatformSettings'
    AND column_name IN (
      'depositPaymentMethod',
      'depositAccountName',
      'depositAccountNumber',
      'depositInstructions'
    )
  ORDER BY column_name;`;

console.log("FOUND COLUMNS:");
console.log(columns);

await sql.end();
