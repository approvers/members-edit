import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import type { JSX } from "react";

import { sessionCookie } from "../.server/store/cookie";

export async function loader({ context }: LoaderFunctionArgs) {
    const { COOKIE_SECRET } = context.cloudflare.env;
    const store = sessionCookie(COOKIE_SECRET);
    return redirect("/", {
        headers: {
            "Set-Cookie": await store.serialize(null),
        },
    });
}

export default function Redirect(): JSX.Element {
    return (
        <main>
            <h1>ログアウト中…</h1>
        </main>
    );
}
