import { redirect, type ActionFunctionArgs } from "@remix-run/cloudflare";
import {
    authenticator,
    twitterAssocAuthenticator,
} from "../.server/store/auth";

export async function action({ request }: ActionFunctionArgs) {
    await authenticator.isAuthenticated(request, {
        failureRedirect: "/",
    });
    return twitterAssocAuthenticator.authenticate("twitter-oauth", request, {
        failureRedirect: "/dashboard",
    });
}

export async function loader() {
    return redirect("/dashboard");
}
