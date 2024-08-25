import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import { FaGithub, FaTwitter } from "react-icons/fa";
import { MdDelete, MdOpenInNew } from "react-icons/md";

import {
    type AssociationLinks,
    getAssociationLinks,
} from "../.server/store/association";
import { authenticator } from "../.server/store/auth";

export async function loader({ request }: LoaderFunctionArgs) {
    const { discordId } = await authenticator.isAuthenticated(request, {
        failureRedirect: "/",
    });
    const associations = await getAssociationLinks(discordId);
    if (!Array.isArray(associations)) {
        return redirect("/");
    }
    return { associations };
}

const AccountIcon = ({ type }: { type: "github" | "twitter" }): JSX.Element =>
    ({
        github: <FaGithub />,
        twitter: <FaTwitter />,
    }[type]);

const AccountList = ({ list }: { list: AssociationLinks }): JSX.Element =>
    list.length === 0 ? (
        <p>関連付けられたアカウントはありません</p>
    ) : (
        <ol>
            {list.map(({ type, id, name }) => (
                <li key={`${type}-${id}`} className="flex items-center gap-4">
                    <AccountIcon type={type} />
                    <a
                        href={`https://${type}.com/${name}`}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        rel="noopener noreferrer"
                        className="flex items-end"
                    >
                        <span className="text-xl underline">{name}</span>
                        <MdOpenInNew />
                    </a>
                    <Form action="/dashboard/remove" method="post">
                        <input type="hidden" name="type" value={type} />
                        <input type="hidden" name="id" value={id} />
                        <button>
                            <MdDelete className="text-red-400" />
                        </button>
                    </Form>
                </li>
            ))}
        </ol>
    );

export default function Dashboard() {
    const { associations } = useLoaderData<typeof loader>();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4">
            <AccountList list={associations} />
            <div className="fixed top-6 left-6">
                <a
                    href="/logout"
                    className="bg-slate-700 text-slate-100 p-4 rounded-2xl"
                >
                    ログアウト
                </a>
            </div>
            <div className="flex gap-8">
                <Form action="/dashboard/add-twitter" method="post">
                    <button className="bg-cyan-400 text-slate-100 p-4 rounded-2xl">
                        Twitter アカウントを追加
                    </button>
                </Form>
                <Form action="/dashboard/add-github" method="post">
                    <button className="bg-slate-800 text-slate-100 p-4 rounded-2xl">
                        GitHub アカウントを追加
                    </button>
                </Form>
            </div>
        </main>
    );
}
