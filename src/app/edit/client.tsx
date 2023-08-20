"use client";

import { AssociationLink, useAssociations } from "@/hooks/associations";
import { useOAuth } from "@/hooks/discord-oauth";
import { useReducer } from "react";
import { nextState } from "./reducer";
import { TWITTER_CLIENT_ID } from "@/store/consts";
import { generate } from "randomstring";
import { openPopupInCenter } from "@/portal/popup";
import { saveState } from "@/store/state";
import { Client } from "twitter-api-sdk";

const AccountList = ({
    list,
}: {
    list: readonly AssociationLink[];
}): JSX.Element =>
    list.length === 0 ? (
        <p>関連付けられたアカウントはありません</p>
    ) : (
        <ol>
            {list.map(({ type, id, name }) => (
                <li key={`${type}-${id}`}>
                    <span>{type}</span>
                    <span>{name}</span>
                </li>
            ))}
        </ol>
    );

const EditableList = ({
    defaultList,
}: {
    defaultList: readonly AssociationLink[];
}) => {
    const [state, dispatch] = useReducer(nextState, { links: defaultList });

    async function handleAddTwitterAccount() {
        const randomState = generate(40);
        saveState(randomState);

        const redirectUri = new URL("/twitter-id", window.location.href);
        const randomChallenge = generate(128);
        const challengeData = new TextEncoder().encode(randomChallenge);
        const hashBuffer = await crypto.subtle.digest("SHA-256", challengeData);
        const challengeHex = Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        const params = new URLSearchParams({
            response_type: "code",
            client_id: TWITTER_CLIENT_ID,
            redirect_uri: redirectUri.toString(),
            scope: "tweet.read users.read",
            state: randomState,
            code_challenge: challengeHex,
            code_challenge_method: "S256",
        });
        const twitterOAuthLink = new URL(
            "/i/oauth2/authorize?" + params,
            "https://twitter.com",
        );
        const popupWindow = openPopupInCenter(twitterOAuthLink);
        if (!popupWindow) {
            return;
        }

        const code = await new Promise<string>((resolve, reject) => {
            popupWindow?.addEventListener("message", async (message) => {
                if (message.origin !== window.location.origin) {
                    return;
                }

                const { code } = message.data;
                if (typeof code !== "string") {
                    console.dir(message.data);
                    reject(new Error("invalid data"));
                    return;
                }
                resolve(code);
            });
            popupWindow?.addEventListener("messageerror", (event) => {
                reject(event.data);
            });
        });

        const body = new URLSearchParams({
            code,
            grant_type: "authorization_code",
            client_id: TWITTER_CLIENT_ID,
            redirect_uri: new URL(
                "/twitter-id",
                window.location.href,
            ).toString(),
            code_verifier: randomChallenge,
        });
        const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
        });
        if (!tokenRes.ok) {
            console.error(await tokenRes.text());
            return;
        }
        const { access_token } = await tokenRes.json();

        const client = new Client(access_token);
        const findRes = await client.users.findMyUser({
            "user.fields": ["id", "username"],
        });
        if (!findRes.data) {
            console.error(findRes.errors);
            return;
        }
        const { id, username } = findRes.data;

        dispatch({
            type: "ADD_LINK",
            link: { type: "twitter", id, name: username },
        });
    }

    return (
        <>
            <AccountList list={state.links} />
            <div className="flex gap-8">
                <button
                    className="bg-cyan-400 text-slate-100 p-4 rounded-2xl"
                    onClick={handleAddTwitterAccount}
                >
                    Twitter アカウントを追加
                </button>
                <button className="bg-slate-700 text-slate-100 p-4 rounded-2xl">
                    保存
                </button>
            </div>
        </>
    );
};

const EditConsole = ({ token }: { token: string }): JSX.Element => {
    const associations = useAssociations(token);

    if (associations[0] === "LOADING") {
        return <h1>読み込み中…</h1>;
    }
    const list = associations[1];

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-xl font-bold">Approvers メンバー情報編集</h1>
            <EditableList defaultList={list} />
        </main>
    );
};

export const EditLogin = (): JSX.Element => {
    const oauth = useOAuth();
    switch (oauth[0]) {
        case "LOADING":
            return (
                <main>
                    <h1>ログイン中…</h1>
                    <p>
                        ログイン認証ウインドウのポップアップを許可してください
                    </p>
                </main>
            );
        case "GOT_ERROR":
            console.error(oauth[1]);
            return (
                <main>
                    <h1>エラーが発生しました</h1>
                    <p>{oauth[1].message}</p>
                </main>
            );
        case "GOT_TOKEN":
            return <EditConsole token={oauth[1]} />;
    }
};
