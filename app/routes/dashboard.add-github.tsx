import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";

import {
    getAuthenticator,
    getGithubAssocAuthenticator,
} from "../.server/store/auth";

export async function action({ request, context }: ActionFunctionArgs) {
    const { COOKIE_SECRET, DISCORD_CLIENT_SECRET, GITHUB_CLIENT_SECRET } =
        context.cloudflare.env;
    await getAuthenticator(
        COOKIE_SECRET,
        DISCORD_CLIENT_SECRET,
    ).isAuthenticated(request, {
        failureRedirect: "/",
    });
    return getGithubAssocAuthenticator(GITHUB_CLIENT_SECRET).authenticate(
        "github-oauth",
        request,
        {
            failureRedirect: "/dashboard",
        },
    );
}

export async function loader() {
    return redirect("/dashboard");
}
