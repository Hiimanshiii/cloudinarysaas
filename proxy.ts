import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)"
]);

const isPublicApiRoute = createRouteMatcher([
  "/api/video",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  console.log("[Middleware] userId for req:", req.url, userId);
  const currentUrl = new URL(req.url);

  const isAccessingHome = currentUrl.pathname.startsWith("/home");
  const isApiRequest = currentUrl.pathname.startsWith("/api");

  // ✅ Logged-in user trying to access public pages → redirect to /home
  if (userId && isPublicRoute(req) && !isAccessingHome) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // ❌ Not logged in
  if (!userId) {
    // API → return 401
    if (isApiRequest && !isPublicApiRoute(req)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Protected routes → redirect to sign-in
    if (!isPublicRoute(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};