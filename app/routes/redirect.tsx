import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import type { JSX } from "react";

import { getAuthenticator } from "../.server/store/auth";
import { sessionCookie } from "../.server/store/cookie";

export default function Redirect(): JSX.Element {
    return (
        <main>
            <h1>画面遷移中…</h1>
        </main>
    );
}

export async function loader({ request, context }: LoaderFunctionArgs) {
    const { COOKIE_SECRET, DISCORD_CLIENT_SECRET, NODE_ENV } =
        context.cloudflare.env;
    const store = sessionCookie(COOKIE_SECRET);
    try {
        const user = await getAuthenticator(
            DISCORD_CLIENT_SECRET,
            NODE_ENV,
        ).authenticate("discord-oauth", request);
        return redirect("/dashboard", {
            headers: {
                "Set-Cookie": await store.serialize(user),
            },
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            return redirect("/");
        }
        throw err;
    }
}
