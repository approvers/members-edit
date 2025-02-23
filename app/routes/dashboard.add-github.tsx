import type { JSX } from "react";
import { type ActionFunctionArgs, redirect } from "react-router";

import {
    getGithubAssocAuthenticator,
    type Member,
} from "../.server/store/auth";
import { sessionCookie } from "../.server/store/cookie";

export async function action({ request, context }: ActionFunctionArgs) {
    const { COOKIE_SECRET, GITHUB_CLIENT_SECRET, NODE_ENV } =
        context.cloudflare.env;
    const cookie = request.headers.get("cookie");
    const user = (await sessionCookie(COOKIE_SECRET).parse(
        cookie,
    )) as Member | null;
    if (!user) {
        return redirect("/");
    }
    try {
        await getGithubAssocAuthenticator(
            GITHUB_CLIENT_SECRET,
            NODE_ENV,
        ).authenticate("github-oauth", request);
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
