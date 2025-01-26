import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import type { JSX } from "react";

import { getAssociationLinks } from "../.server/store/association";
import {
    getAuthenticator,
    getTwitterAssocAuthenticator,
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
        TWITTER_CLIENT_SECRET,
        NODE_ENV,
    } = context.cloudflare.env;
    const { discordToken, discordId } = await getAuthenticator(
        COOKIE_SECRET,
        DISCORD_CLIENT_SECRET,
        NODE_ENV,
    ).isAuthenticated(request, {
        failureRedirect: "/",
    });
    const twitterAssocAuth = getTwitterAssocAuthenticator(
        TWITTER_CLIENT_SECRET,
        NODE_ENV,
    );
    const { id: addingId, name: addingName } =
        await twitterAssocAuth.authenticate("twitter-oauth", request, {
            failureRedirect: "/dashboard",
        });
    if (!addingId || !addingName) {
        console.log("bad parameters");
        return redirect("/dashboard");
    }

    const associations = await getAssociationLinks(discordId);
    const newList = associations.filter(
        ({ type, id }) => !(type === "twitter" && id === addingId),
    );
    newList.push({ type: "twitter", id: addingId, name: addingName });
    const res = await fetch(
        `https://members.approvers.dev/members/${discordId}/associations`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${discordToken}`,
            },
            body: JSON.stringify(newList),
        },
    );
    if (!res.ok) {
        console.log("adding twitter account: " + (await res.text()));
    }
    return twitterAssocAuth.logout(request, {
        redirectTo: "/dashboard",
    });
}
