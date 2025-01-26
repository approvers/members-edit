import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import type { JSX } from "react";

import { getAssociationLinks } from "../.server/store/association";
import { getAuthenticator } from "../.server/store/auth";

export async function action({ request, context }: ActionFunctionArgs) {
    const { COOKIE_SECRET, DISCORD_CLIENT_SECRET, NODE_ENV } =
        context.cloudflare.env;
    const { discordToken, discordId } = await getAuthenticator(
        COOKIE_SECRET,
        DISCORD_CLIENT_SECRET,
        NODE_ENV,
    ).isAuthenticated(request, {
        failureRedirect: "/",
    });
    if (request.method !== "POST") {
        return redirect("/dashboard");
    }
    const form = await request.formData();

    const targetType = form.get("type");
    const targetId = form.get("id");
    const associations = await getAssociationLinks(discordId);
    const newList = associations.filter(
        ({ type, id }) => !(type === targetType && id === targetId),
    );
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
        console.error("removing account: " + (await res.text()));
    }
    return redirect("/dashboard");
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
