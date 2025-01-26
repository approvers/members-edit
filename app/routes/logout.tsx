import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import type { JSX } from "react";

import { getAuthenticator } from "../.server/store/auth";

export async function loader({ request, context }: LoaderFunctionArgs) {
    const { COOKIE_SECRET, DISCORD_CLIENT_SECRET, NODE_ENV } =
        context.cloudflare.env;
    await getAuthenticator(
        COOKIE_SECRET,
        DISCORD_CLIENT_SECRET,
        NODE_ENV,
    ).logout(request, { redirectTo: "/" });
}

export default function Redirect(): JSX.Element {
    return (
        <main>
            <h1>ログアウト中…</h1>
        </main>
    );
}
