import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

import { getAuthenticator } from "../.server/store/auth";

export async function loader({ request, context }: LoaderFunctionArgs) {
    const { COOKIE_SECRET, DISCORD_CLIENT_SECRET } = context.cloudflare.env;
    await getAuthenticator(COOKIE_SECRET, DISCORD_CLIENT_SECRET).logout(
        request,
        { redirectTo: "/" },
    );
}
