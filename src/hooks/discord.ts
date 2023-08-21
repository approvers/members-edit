"use client";

import { openPopupInCenter } from "@/portal/popup";
import { DISCORD_CLIENT_ID } from "@/store/consts";
import { removeState, saveState } from "@/store/state";
import { generate } from "randomstring";
import { useEffect, useRef, useState } from "react";

export type OAuthProgress =
    | [state: "LOADING"]
    | [state: "GOT_TOKEN", token: string]
    | [state: "GOT_ERROR", error: Error];

export const useDiscordOAuth = (): [OAuthProgress, () => void] => {
    const popupRef = useRef<Window | null>(null);
    const [refresher, setRefresher] = useState<{
        refreshToken: string;
        expiresIn: number;
    } | null>(null);
    const [progress, setProgress] = useState<OAuthProgress>(["LOADING"]);

    useEffect(() => {
        const rx = new BroadcastChannel("discord-oauth-code-channel");
        rx.addEventListener(
            "message",
            async ({ data, origin }: MessageEvent) => {
                const { type } = data;
                if (
                    typeof type !== "string" ||
                    origin !== window.location.origin
                ) {
                    return;
                }
                if (type === "ERROR") {
                    setProgress(["GOT_ERROR", data.error]);
                    return;
                }

                const { code } = data;
                if (typeof code !== "string") {
                    console.error("invalid message");
                    console.dir(data);
                    return;
                }
                const tokenRes = await fetch("/token", {
                    method: "POST",
                    body: JSON.stringify({ code }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (!tokenRes.ok) {
                    console.error(await tokenRes.text());
                    return;
                }
                const response = await tokenRes.json();
                setRefresher({
                    refreshToken: response.refresh_token,
                    expiresIn: response.expires_in,
                });
                setProgress(["GOT_TOKEN", response.access_token]);
                popupRef.current?.close();
            },
        );
    }, []);

    useEffect(() => {
        if (refresher === null) {
            return;
        }
        const abort = new AbortController();
        console.info(
            `token will be refreshed in ${refresher.expiresIn} seconds`,
        );
        const refreshTimer = setTimeout(async () => {
            const refreshRes = await fetch("/refresh", {
                method: "POST",
                body: JSON.stringify({
                    refreshToken: refresher.refreshToken,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
                signal: abort.signal,
            });
            if (!refreshRes.ok) {
                console.error(await refreshRes.text());
                return;
            }
            const response = await refreshRes.json();
            setRefresher({
                refreshToken: response.refresh_token,
                expiresIn: response.expires_in,
            });
            setProgress(["GOT_TOKEN", response.access_token]);
        }, refresher.expiresIn * 1000);
        return () => {
            clearTimeout(refreshTimer);
            abort.abort();
        };
    }, [refresher]);

    async function handleLogin() {
        const state = generate(40);
        saveState(state);

        const params = new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            redirect_uri: new URL("/redirect", window.location.href).toString(),
            response_type: "code",
            scope: "identify guilds.members.read",
            state,
            prompt: "none",
        });
        const url = new URL(
            "/oauth2/authorize?" + params,
            "https://discord.com",
        );
        const popup = openPopupInCenter(url, "discord-oauth2");
        popupRef.current = popup;
        popup?.addEventListener("close", () => {
            setProgress((progress) =>
                progress[0] === "LOADING"
                    ? ["GOT_ERROR", new Error("popup was closed forcefully")]
                    : progress,
            );
        });
    }

    return [progress, handleLogin];
};
