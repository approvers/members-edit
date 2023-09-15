import { GITHUB_CLIENT_ID } from "@/store/consts";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
    const githubSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!githubSecret) {
        console.error("GITHUB_CLIENT_SECRET was not set");
        return NextResponse.json({}, { status: 500 });
    }

    const { code } = await request.json();
    if (!code) {
        return NextResponse.json({}, { status: 400 });
    }

    const body = new URLSearchParams({
        code,
        client_id: GITHUB_CLIENT_ID,
        client_secret: githubSecret,
        redirect_uri: new URL("/github-id", request.url).toString(),
    });
    const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
    });
    if (!res.ok) {
        console.error(await res.text());
        return NextResponse.json({}, { status: 500 });
    }
    const params = new URLSearchParams(await res.text());
    return NextResponse.json(Object.fromEntries(params.entries()), {
        status: res.status,
    });
}
