import { redirect, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { authenticator } from "../.server/store/auth";
import { getAssociationLinks } from "../.server/store/association";

export async function action({ request }: ActionFunctionArgs) {
    const { discordToken, discordId } = await authenticator.isAuthenticated(
        request,
        {
            failureRedirect: "/",
        },
    );
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
