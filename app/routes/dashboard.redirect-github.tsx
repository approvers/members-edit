import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import type { JSX } from "react";

import { getAssociationLinks } from "../.server/store/association";
import {
    getGithubAssocAuthenticator,
    type Member,
} from "../.server/store/auth";
import { sessionCookie } from "../.server/store/cookie";

export default function Redirect(): JSX.Element {
    return (
        <main>
            <h1>画面遷移中…</h1>
        </main>
    );
}

export async function loader({ request, context }: LoaderFunctionArgs) {
    const { COOKIE_SECRET, GITHUB_CLIENT_SECRET, NODE_ENV } =
        context.cloudflare.env;
    const cookie = request.headers.get("cookie");
    const user = (await sessionCookie(COOKIE_SECRET).parse(
        cookie,
    )) as Member | null;
    if (!user) {
        return redirect("/");
    }
    const { discordToken, discordId } = user;
    const githubAssocAuth = getGithubAssocAuthenticator(
        GITHUB_CLIENT_SECRET,
        NODE_ENV,
    );
    try {
        const { id: addingId, name: addingName } =
            await githubAssocAuth.authenticate("github-oauth", request);
        if (!addingId || !addingName) {
            console.log("bad parameters");
            return redirect("/dashboard");
        }

        const associations = await getAssociationLinks(discordId);
        const newList = associations.filter(
            ({ type, id }) => !(type === "github" && id === addingId),
        );
        newList.push({ type: "github", id: addingId, name: addingName });
        const res = await fetch(
            `https://members.approvers.dev/members/${discordId}/associations`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${discordToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newList),
            },
        );
        if (!res.ok) {
            console.log(`adding github account: ${await res.text()}`);
        }
    } catch (err: unknown) {
        console.error(err);
    }
    return redirect("/dashboard");
}
