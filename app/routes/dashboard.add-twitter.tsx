import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import type { JSX } from "react";

import {
    getAuthenticator,
    getTwitterAssocAuthenticator,
    type Member,
} from "../.server/store/auth";
import { sessionCookie } from "../.server/store/cookie";

export async function action({ request, context }: ActionFunctionArgs) {
    const { COOKIE_SECRET, TWITTER_CLIENT_SECRET, NODE_ENV } =
        context.cloudflare.env;
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
    } catch {
        return redirect("/dashboard");
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
