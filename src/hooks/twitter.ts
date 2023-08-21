"use client";

import { useEffect, useRef, useState } from "react";
import { TWITTER_CLIENT_ID } from "@/store/consts";
import { generate } from "randomstring";
import { openPopupInCenter } from "@/portal/popup";
import { removeState, saveState } from "@/store/state";
import { generators } from "openid-client";

export const useTwitterOAuth = (
    onFoundUser: (data: { id: string; username: string }) => void,
) => {
    const popupRef = useRef<Window | null>(null);
    const [challenge, setChallenge] = useState<string | null>(null);

    useEffect(() => {
        if (!challenge) {
            return;
        }
        const abort = new AbortController();

        const rx = new BroadcastChannel("twitter-oauth-code-channel");
        rx.addEventListener("message", async (message) => {
            const { type } = message.data;
            if (typeof type !== "string" || origin !== window.location.origin) {
                return;
            }

            const { code, error } = message.data;
            if (type === "ERROR") {
                console.error(error);
                popupRef.current?.close();
                return;
            }
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
            const { data } = await meRes.json();

            if (abort.signal.aborted || !data) {
                return;
            }
            onFoundUser(data);
            popupRef.current?.close();
        });

        return () => {
            removeState();
            abort.abort();
            popupRef.current = null;
        };
    }, [onFoundUser, challenge]);

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

    return handleAddTwitterAccount;
};
