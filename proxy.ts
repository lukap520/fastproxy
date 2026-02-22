import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/dashboard"];
const AUTH_ROUTES = ["/login", "/register"];
const ADMIN_ROUTES = ["/dashboard/admin"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;
    const token = accessToken || refreshToken;

    const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
    const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));
    const isAdminRoute = ADMIN_ROUTES.some((p) => pathname.startsWith(p));

    let payload: any = null;
    if (token) {
        try {
            payload = JSON.parse(atob(token.split(".")[1]));
        } catch (e) {
            payload = null;
        }
    }

    if ((isProtected || isAdminRoute) && !token) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    if (isAuthRoute && token) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    if (isAdminRoute && payload?.role !== "ADMIN") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
};
