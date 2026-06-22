import type { JSX } from "react";
import { redirect } from "react-router";

import {
    getTwitterAssocAuthenticator,
    type Member,
} from "../.server/store/auth";
import { sessionCookie } from "../.server/store/cookie";
import { CloudflareContext } from "../cloudflare-context";
import type { Route } from "./+types/dashboard.add-twitter";

export async function action({ request, context }: Route.ActionArgs) {
    const { COOKIE_SECRET, TWITTER_CLIENT_SECRET, NODE_ENV } =
        context.get(CloudflareContext).cloudflare.env;
    const cookie = request.headers.get("cookie");
    const user = (await sessionCookie(COOKIE_SECRET).parse(
        cookie,
    )) as Member | null;
    if (!user) {
        return redirect("/");
    }
    try {
        return getTwitterAssocAuthenticator(
            TWITTER_CLIENT_SECRET,
            NODE_ENV,
        ).authenticate("twitter-oauth", request);
    } catch (err: unknown) {
        if (err instanceof Error) {
            return redirect("/dashboard");
        }
        throw err;
    }
}

export async function loader() {
    return redirect("/dashboard");
}

export default function Redirect(): JSX.Element {
    return (
        <main>
            <h1>画面遷移中…</h1>
        </main>
    );
}
