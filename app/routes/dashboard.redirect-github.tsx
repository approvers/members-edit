import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { authenticator, githubAssocAuthenticator } from "../.server/store/auth";
import { getAssociationLinks } from "../.server/store/association";

export default function Redirect(): JSX.Element {
    return (
        <main>
            <h1>画面遷移中…</h1>
        </main>
    );
}
export async function loader({ request }: LoaderFunctionArgs) {
    const { discordToken, discordId } = await authenticator.isAuthenticated(
        request,
        {
            failureRedirect: "/",
        },
    );
    const { id: addingId, name: addingName } =
        await githubAssocAuthenticator.isAuthenticated(request, {
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
    console.log({ newList });
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
    return redirect("/dashboard");
}
