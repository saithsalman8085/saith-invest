
import "dotenv/config";
import postgres from "postgres";
import { randomBytes } from "node:crypto";

const sql = postgres(process.env.DATABASE_URL, {
  ssl: "require",
});

function generateCode() {
  return randomBytes(6).toString("hex").toUpperCase();
}

async function main() {
  try {
    await sql.begin(async (tx) => {
      const users = await tx`
        SELECT id, "referralCode"
        FROM "User"
        ORDER BY id
        FOR UPDATE
      `;

      const targets = users.filter(
        (user) =>
          typeof user.referralCode === "string" &&
          user.referralCode.startsWith("SAITH")
      );

      if (targets.length === 0) {
        console.log("Kisi referral code mein SAITH prefix nahi mila.");
        return;
      }

      const targetIds = new Set(targets.map((user) => user.id));

      const usedCodes = new Set(
        users
          .filter((user) => !targetIds.has(user.id))
          .map((user) => user.referralCode)
      );

      const assignments = [];

      for (const user of targets) {
        let code = user.referralCode.slice(5);

        if (!code || usedCodes.has(code)) {
          do {
            code = generateCode();
          } while (usedCodes.has(code));
        }

        usedCodes.add(code);
        assignments.push({ id: user.id, code });
      }

      // Temporary unique codes prevent collisions during updates.
      for (const user of targets) {
        let tempCode;

        do {
          tempCode = `TMP${randomBytes(16).toString("hex").toUpperCase()}`;
        } while (usedCodes.has(tempCode));

        usedCodes.add(tempCode);

        await tx`
          UPDATE "User"
          SET "referralCode" = ${tempCode}
          WHERE id = ${user.id}
        `;
      }

      for (const item of assignments) {
        await tx`
          UPDATE "User"
          SET "referralCode" = ${item.code}
          WHERE id = ${item.id}
        `;
      }

      console.log(`${assignments.length} referral codes successfully updated.`);
    });
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error("Update failed:", error.message);
  process.exitCode = 1;
});
