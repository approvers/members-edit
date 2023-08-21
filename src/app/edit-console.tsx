"use client";

import { AssociationLink, useAssociations } from "@/hooks/associations";
import { useEffect, useReducer, useRef, useState } from "react";
import { nextState } from "./reducer";
import { TWITTER_CLIENT_ID } from "@/store/consts";
import { generate } from "randomstring";
import { openPopupInCenter } from "@/portal/popup";
import { removeState, saveState } from "@/store/state";
import { generators } from "openid-client";

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
    const popupRef = useRef<Window | null>(null);
    const [challenge, setChallenge] = useState<string | null>(null);
    const [state, dispatch] = useReducer(nextState, { links: defaultList });

    useEffect(() => {
        if (!challenge) {
            return;
        }
        const abort = new AbortController();

        const rx = new BroadcastChannel("twitter-oauth-code-channel");
        rx.addEventListener("message", async (message) => {
            if (message.origin !== window.location.origin) {
                return;
            }

            const { code } = message.data;
            if (typeof code !== "string") {
                console.dir(message.data);
                throw new Error("invalid data");
            }
            const tokenRes = await fetch("/twitter-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code, challenge }),
                signal: abort.signal,
            });
            if (!tokenRes.ok) {
                console.error(await tokenRes.text());
                return;
            }
            const { access_token } = await tokenRes.json();

            const meRes = await fetch("/twitter-me", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
                signal: abort.signal,
            });
            if (!meRes.ok) {
                console.error(await meRes.text());
                return;
            }
            const { id, username } = await meRes.json();

            if (abort.signal.aborted || !id || !username) {
                return;
            }
            dispatch({
                type: "ADD_LINK",
                link: { type: "twitter", id, name: username },
            });
        });

        return () => {
            removeState();
            abort.abort();
            popupRef.current = null;
        };
    }, [challenge, popupRef]);

    async function handleAddTwitterAccount() {
        const randomState = generate(40);
        saveState(randomState);

        const redirectUri = new URL("/twitter-id", window.location.href);
        const challengeVerifier = generators.codeVerifier();
        const challengeBase64 = generators.codeChallenge(challengeVerifier);
        const params = new URLSearchParams({
            response_type: "code",
            client_id: TWITTER_CLIENT_ID,
            redirect_uri: redirectUri.toString(),
            scope: "tweet.read users.read",
            state: randomState,
            code_challenge: challengeBase64,
            code_challenge_method: "S256",
        });
        const twitterOAuthLink = new URL(
            "/i/oauth2/authorize?" + params,
            "https://twitter.com",
        );
        popupRef.current = openPopupInCenter(
            twitterOAuthLink,
            "twitter-oauth2",
        );
        setChallenge(challengeVerifier);
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

export const EditConsole = ({ token }: { token: string }): JSX.Element => {
    const associations = useAssociations(token);

    if (associations[0] === "LOADING") {
        return <h1>読み込み中…</h1>;
    }
    const list = associations[1];

    return <EditableList defaultList={list} />;
};
