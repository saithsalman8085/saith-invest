import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

try {
  await sql`
    UPDATE "User"
    SET "role" = 'ADMIN'
    WHERE "id" = 'b5l6wkz2pbxq3fhsn9lf4w02'
  `;

  console.log("Account role changed to ADMIN successfully.");
} catch (error) {
  console.error(error);
} finally {
  await sql.end();
}