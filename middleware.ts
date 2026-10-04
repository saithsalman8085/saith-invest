import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

const secretKey = secret
  ? new TextEncoder().encode(secret)
  : null;

async function getSessionUserId(
  token: string | undefined
) {
  if (!token || !secretKey) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      secretKey
    );

    if (
      typeof payload.userId !== "string" ||
      !payload.userId
    ) {
      return null;
    }

    return payload.userId;
  } catch {
    return null;
  }
}

export async function middleware(
  request: NextRequest
) {
  const pathname = request.nextUrl.pathname;

  const isDashboard =
    pathname.startsWith("/dashboard");

  const isAdmin =
    pathname.startsWith("/admin");

  if (!isDashboard && !isAdmin) {
    return NextResponse.next();
  }

  const token = request.cookies.get(
    "claudeinvest_session"
  )?.value;

  const userId =
    await getSessionUserId(token);

  if (!userId) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  if (isAdmin) {
    const allowedAdminId =
      process.env.ADMIN_USER_ID;

    if (
      !allowedAdminId ||
      userId !== allowedAdminId
    ) {
      return NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};