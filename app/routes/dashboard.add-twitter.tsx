import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import type { JSX } from "react";

import {
    getAuthenticator,
    getTwitterAssocAuthenticator,
} from "../.server/store/auth";

export async function action({ request, context }: ActionFunctionArgs) {
    const {
        COOKIE_SECRET,
        DISCORD_CLIENT_SECRET,
        TWITTER_CLIENT_SECRET,
        NODE_ENV,
    } = context.cloudflare.env;
    await getAuthenticator(
        COOKIE_SECRET,
        DISCORD_CLIENT_SECRET,
        NODE_ENV,
    ).isAuthenticated(request, {
        failureRedirect: "/",
    });
    return getTwitterAssocAuthenticator(
        TWITTER_CLIENT_SECRET,
        NODE_ENV,
    ).authenticate("twitter-oauth", request, {
        failureRedirect: "/dashboard",
    });
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
