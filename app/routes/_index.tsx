import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";

import { getAuthenticator } from "../.server/store/auth.js";
import { sessionCookie } from "../.server/store/cookie.js";

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
    try {
        const store = sessionCookie(COOKIE_SECRET);
        const user = await getAuthenticator(
            DISCORD_CLIENT_SECRET,
            NODE_ENV,
        ).authenticate("discord-oauth", request);
        return redirect("/dashboard", {
            headers: {
                "Set-Cookie": await store.serialize(user),
            },
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            return redirect("/");
        }
        throw err;
    }
}
