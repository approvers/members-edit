import { DISCORD_CLIENT_ID } from "@/store/consts";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: Request): Promise<NextResponse> {
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;

    if (!clientSecret) {
        console.error("DISCORD_CLIENT_SECRET was not set");
        return NextResponse.json({}, { status: 500 });
    }

    const { code } = await request.json();
    if (typeof code !== "string") {
        return NextResponse.json({}, { status: 400 });
    }
    const body = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        redirect_uri: new URL("/redirect", request.url).toString(),
        code,
    });
    const url = new URL("/api/v10/oauth2/token", "https://discord.com");
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
    });

    return NextResponse.json(await res.json(), { status: res.status });
}
