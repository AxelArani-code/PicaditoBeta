import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES   = ["/login", "/register"];
const DASHBOARD_PREFIX = "/dashboard";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get("picadito_access_token")?.value;
  const isAuthenticated = Boolean(accessToken);

  // Redirigir usuarios autenticados que intentan acceder a auth pages
  if (isAuthenticated && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/inicio", request.url));
  }

  // Proteger rutas del dashboard
  if (pathname.startsWith(DASHBOARD_PREFIX) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
