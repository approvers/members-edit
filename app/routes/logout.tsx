import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { authenticator } from "../.server/store/auth";

export async function loader({ request }: LoaderFunctionArgs) {
    await authenticator.logout(request, { redirectTo: "/" });
}
