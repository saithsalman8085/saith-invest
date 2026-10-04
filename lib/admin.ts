import { db } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function requireAdmin() {
  const userId = await getCurrentUserId();
  const allowedAdminId = process.env.ADMIN_USER_ID;

  if (!userId || !allowedAdminId || userId !== allowedAdminId) {
    return null;
  }

  const user = await db.orm.public.User
    .where((item) => item.id.eq(userId))
    .first();

  if (!user || String(user.role) !== "ADMIN") {
    return null;
  }

  return user;
}