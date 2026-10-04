import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

try {
await sql`     ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "premiumBadge" BOOLEAN NOT NULL DEFAULT false;
  `;

console.log("premiumBadge added successfully.");
} finally {
await sql.end();
}
