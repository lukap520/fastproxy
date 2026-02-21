import { cookies } from "next/headers";

export async function setAuthCookies({
    accessToken,
    refreshToken,
}: {
    accessToken: string;
    refreshToken: string;
}) {
    const cookieStore = await cookies();

    cookieStore.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
    });

    cookieStore.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
    });
}

export async function clearAuthCookies() {
    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
}
