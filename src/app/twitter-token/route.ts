import { TWITTER_CLIENT_ID } from "@/store/consts";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: Request): Promise<NextResponse> {
    const twitterSecret = process.env.TWITTER_CLIENT_SECRET;
    if (!twitterSecret) {
        console.error("TWITTER_CLIENT_SECRET was not set");
        return NextResponse.json({}, { status: 500 });
    }

    const { code, challenge } = await request.json();
    if (typeof code !== "string" || typeof challenge !== "string") {
        return NextResponse.json({}, { status: 400 });
    }
    const body = new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: TWITTER_CLIENT_ID,
        redirect_uri: new URL("/twitter-id", request.url).toString(),
        code_verifier: challenge,
    });
    const auth = `${TWITTER_CLIENT_ID}:${twitterSecret}`;
    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(auth).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
    });
    return NextResponse.json(await tokenRes.json(), {
        status: tokenRes.status,
    });
}
