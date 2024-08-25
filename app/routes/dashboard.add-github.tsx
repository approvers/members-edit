import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { authenticator, githubAssocAuthenticator } from "../.server/store/auth";

export async function action({ request }: ActionFunctionArgs) {
    await authenticator.isAuthenticated(request, {
        failureRedirect: "/",
    });
    return githubAssocAuthenticator.authenticate("github-oauth", request, {
        failureRedirect: "/dashboard",
    });
}
