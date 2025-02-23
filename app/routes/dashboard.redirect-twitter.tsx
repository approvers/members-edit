import { type LoaderFunctionArgs, redirect } from "react-router";
import type { JSX } from "react";

import { getAssociationLinks } from "../.server/store/association";
import {
    getTwitterAssocAuthenticator,
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
    const { COOKIE_SECRET, TWITTER_CLIENT_SECRET, NODE_ENV } =
        context.cloudflare.env;
    const cookie = request.headers.get("cookie");
    const user = (await sessionCookie(COOKIE_SECRET).parse(
        cookie,
    )) as Member | null;
    if (!user) {
        return redirect("/");
    }
    const { discordToken, discordId } = user;
    const twitterAssocAuth = getTwitterAssocAuthenticator(
        TWITTER_CLIENT_SECRET,
        NODE_ENV,
    );
    try {
        const { id: addingId, name: addingName } =
            await twitterAssocAuth.authenticate("twitter-oauth", request);
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
            console.log(`adding twitter account: ${await res.text()}`);
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err);
        } else {
            throw err;
        }
    }
    return redirect("/dashboard");
}
