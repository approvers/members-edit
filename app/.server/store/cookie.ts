import { type Cookie, createCookie } from "@remix-run/cloudflare";

export const sessionCookie = (cookieSecret: string): Cookie =>
    createCookie("edit.members.approvers.dev", {
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secrets: [cookieSecret],
        secure: process.env.NODE_ENV === "production",
    });
