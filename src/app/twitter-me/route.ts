import { NextResponse } from "next/server";
import { Client } from "twitter-api-sdk";

export async function GET(request: Request): Promise<NextResponse> {
    const auth = request.headers.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
        return NextResponse.json({}, { status: 400 });
    }
    const accessToken = auth.substring("Bearer ".length);
    const client = new Client(accessToken);
    const findRes = await client.users.findMyUser({
        "user.fields": ["id", "username"],
    });
    return NextResponse.json(findRes.data, {
        status: findRes.errors ? 500 : 200,
    });
}
