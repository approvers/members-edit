import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: Request): Promise<NextResponse> {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error("DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET was not set");
        return NextResponse.json({}, { status: 500 });
    }

    const { code } = await request.json();
    if (typeof code !== "string") {
        return NextResponse.json({}, { status: 400 });
    }
    const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        redirect_uri: new URL("/redirect", request.url).toString(),
        code,
    });
    const url = new URL(
        "/api/v10/oauth2/token?" + params,
        "https://discord.com",
    );
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    return NextResponse.json(await res.json(), { status: res.status });
}
