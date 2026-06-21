import type { JSX } from "react";
import { type LoaderFunctionArgs, redirect } from "react-router";

import { sessionCookie } from "../.server/store/cookie";
import type { Route } from "./+types/logout";

export async function loader({ context }: Route.LoaderArgs) {
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
