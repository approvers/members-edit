import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";

import {
    getAuthenticator,
    getTwitterAssocAuthenticator,
} from "../.server/store/auth";

export async function action({ request, context }: ActionFunctionArgs) {
    const { COOKIE_SECRET, DISCORD_CLIENT_SECRET, TWITTER_CLIENT_SECRET } =
        context.cloudflare.env;
    await getAuthenticator(
        COOKIE_SECRET,
        DISCORD_CLIENT_SECRET,
    ).isAuthenticated(request, {
        failureRedirect: "/",
    });
    return getTwitterAssocAuthenticator(TWITTER_CLIENT_SECRET).authenticate(
        "twitter-oauth",
        request,
        {
            failureRedirect: "/dashboard",
        },
    );
}

export async function loader() {
    return redirect("/dashboard");
}
