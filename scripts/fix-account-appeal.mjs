
import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

try {
  await sql.begin(async (tx) => {
    await tx`
      DO $$ BEGIN
        CREATE TYPE "public"."AppealStatus"
        AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS "public"."AccountAppeal" (
        "id" text PRIMARY KEY,
        "userId" text NOT NULL,
        "message" text NOT NULL,
        "status" "public"."AppealStatus" NOT NULL DEFAULT 'PENDING',
        "adminNote" text,
        "reviewedById" text,
        "createdAt" timestamp(3) NOT NULL DEFAULT now(),
        "reviewedAt" timestamp(3),
        "updatedAt" timestamp(3) NOT NULL,
        CONSTRAINT "AccountAppeal_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;

    await tx`CREATE INDEX IF NOT EXISTS "AccountAppeal_userId_idx" ON "public"."AccountAppeal" ("userId")`;
    await tx`CREATE INDEX IF NOT EXISTS "AccountAppeal_status_idx" ON "public"."AccountAppeal" ("status")`;
    await tx`CREATE INDEX IF NOT EXISTS "AccountAppeal_createdAt_idx" ON "public"."AccountAppeal" ("createdAt")`;
  });

  console.log("AccountAppeal table created successfully.");
} catch (error) {
  console.error("Failed:", error.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
