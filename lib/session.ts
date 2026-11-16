
import { cookies } from "next/headers";
import { verifySession, verifySessionVersion } from "./auth";
import { db } from "@/lib/prisma";

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("claudeinvest_session")?.value;

  if (!token) {
    return null;
  }

  const userId = await verifySession(token);
  const sessionVersion = await verifySessionVersion(token);

  if (!userId || sessionVersion === null) {
    return null;
  }

  const user = await db.orm.public.User
    .where((item) => item.id.eq(userId))
    .first();

  if (
    !user ||
    String(user.status) !== "ACTIVE" ||
    Number(user.sessionVersion ?? 0) !== sessionVersion
  ) {
    return null;
  }

  return userId;
}
