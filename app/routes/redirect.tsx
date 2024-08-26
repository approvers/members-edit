import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

import { getAuthenticator } from "../.server/store/auth";

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
    return getAuthenticator(
        COOKIE_SECRET,
        DISCORD_CLIENT_SECRET,
        NODE_ENV,
    ).authenticate("discord-oauth", request, {
        successRedirect: "/dashboard",
        failureRedirect: "/",
    });
}
