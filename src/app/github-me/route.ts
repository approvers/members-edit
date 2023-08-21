import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request): Promise<NextResponse> {
    const auth = request.headers.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
        return NextResponse.json({}, { status: 401 });
    }

    const res = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: auth,
        },
    });
    return NextResponse.json(await res.json(), { status: res.status });
}
