import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";

import { getAuthenticator } from "../.server/store/auth.js";

export default function Index() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-xl font-bold">Approvers メンバー情報編集</h1>
            <Form method="post">
                <button className="bg-indigo-500 text-slate-100 p-4 rounded-2xl">
                    Discord でログイン
                </button>
            </Form>
        </main>
    );
}

export async function action({ request, context }: ActionFunctionArgs) {
    const { COOKIE_SECRET, DISCORD_CLIENT_SECRET, NODE_ENV } =
        context.cloudflare.env;
    return getAuthenticator(
        COOKIE_SECRET,
        DISCORD_CLIENT_SECRET,
        NODE_ENV,
    ).authenticate("discord-oauth", request, {
        successRedirect: "/dashboard",
        failureRedirect: "/",
    });
}
