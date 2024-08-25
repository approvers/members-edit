import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { authenticator } from "../.server/store/auth";

export default function Redirect(): JSX.Element {
    return (
        <main>
            <h1>画面遷移中…</h1>
        </main>
    );
}

export async function loader({ request }: LoaderFunctionArgs) {
    return authenticator.authenticate("discord-oauth", request, {
        successRedirect: "/dashboard",
        failureRedirect: "/",
    });
}
