import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<NextResponse> {
    const auth = request.headers.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
        return NextResponse.json({}, { status: 400 });
    }
    const params = new URLSearchParams({
        "user.fields": "id,username",
    });
    const meRes = await fetch("https://api.twitter.com/2/users/me?" + params, {
        headers: {
            Authorization: auth,
        },
    });
    return NextResponse.json(await meRes.json(), { status: meRes.status });
}
