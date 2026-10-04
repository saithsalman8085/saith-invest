
import { cookies } from "next/headers";
import { verifySession } from "./auth";

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("claudeinvest_session")?.value;

  if (!token) {
    return null;
  }

  return await verifySession(token);
}