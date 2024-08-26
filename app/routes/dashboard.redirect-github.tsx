import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";

import { getAssociationLinks } from "../.server/store/association";
import {
    getAuthenticator,
    getGithubAssocAuthenticator,
} from "../.server/store/auth";

export default function Redirect(): JSX.Element {
    return (
        <main>
            <h1>画面遷移中…</h1>
        </main>
    );
}

export async function loader({ request, context }: LoaderFunctionArgs) {
    const {
        COOKIE_SECRET,
        DISCORD_CLIENT_SECRET,
        GITHUB_CLIENT_SECRET,
        NODE_ENV,
    } = context.cloudflare.env;
    const { discordToken, discordId } = await getAuthenticator(
        COOKIE_SECRET,
        DISCORD_CLIENT_SECRET,
        NODE_ENV,
    ).isAuthenticated(request, {
        failureRedirect: "/",
    });
    const githubAssocAuth = getGithubAssocAuthenticator(
        GITHUB_CLIENT_SECRET,
        NODE_ENV,
    );
    const { id: addingId, name: addingName } =
        await githubAssocAuth.authenticate("github-oauth", request, {
            failureRedirect: "/dashboard",
        });
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
        console.log("adding github account: " + (await res.text()));
    }
    return githubAssocAuth.logout(request, {
        redirectTo: "/dashboard",
    });
}
