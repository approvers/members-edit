import type { JSX } from "react";
import { redirect } from "react-router";

import { getAuthenticator } from "../.server/store/auth";
import { sessionCookie } from "../.server/store/cookie";
import { CloudflareContext } from "../cloudflare-context";
import type { Route } from "./+types/redirect";

export default function Redirect(): JSX.Element {
    return (
        <main>
            <h1>画面遷移中…</h1>
        </main>
    );
}

export async function loader({ request, context }: Route.LoaderArgs) {
    const { COOKIE_SECRET, DISCORD_CLIENT_SECRET, NODE_ENV } =
        context.get(CloudflareContext).cloudflare.env;
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
