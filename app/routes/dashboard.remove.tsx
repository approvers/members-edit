import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import type { JSX } from "react";

import type { Member } from "../.server/store/auth";
import { getAssociationLinks } from "../.server/store/association";
import { sessionCookie } from "../.server/store/cookie";

export async function action({ request, context }: ActionFunctionArgs) {
    const { COOKIE_SECRET } = context.cloudflare.env;
    const cookie = request.headers.get("cookie");
    const user = (await sessionCookie(COOKIE_SECRET).parse(
        cookie,
    )) as Member | null;
    if (!user) {
        return redirect("/");
    }
    const { discordToken, discordId } = user;
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
        console.error(`removing account: ${await res.text()}`);
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
