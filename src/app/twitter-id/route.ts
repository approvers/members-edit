import { NextResponse } from "next/server";
import { Client } from "twitter-api-sdk";

export async function GET(request: Request): Promise<NextResponse> {
    const twitterToken = process.env.TWITTER_TOKEN;
    if (!twitterToken) {
        return NextResponse.json({}, { status: 500 });
    }

    const username = new URL(request.url).searchParams.get("username");
    if (!username) {
        return NextResponse.json({}, { status: 400 });
    }

    const client = new Client(twitterToken);
    const res = await client.users.findUserByUsername(username);

    if (!res.data) {
        return NextResponse.json({}, { status: 404 });
    }
    return NextResponse.json({ id: res.data.id });
}
