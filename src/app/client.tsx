"use client";

import { openPopupInCenter } from "@/portal/popup";
import { DISCORD_CLIENT_ID } from "@/store/consts";
import { removeState, saveState } from "@/store/state";
import { generate } from "randomstring";
import { useEffect, useRef, useState } from "react";
import { EditConsole } from "./edit-console";

export type OAuthProgress =
    | [state: "LOADING"]
    | [state: "GOT_TOKEN", token: string]
    | [state: "GOT_ERROR", error: Error];

export const IndexClient = (): JSX.Element => {
    const popupRef = useRef<Window | null>(null);
    const [refresher, setRefresher] = useState<{
        refreshToken: string;
        expiresIn: number;
    } | null>(null);
    const [progress, setProgress] = useState<OAuthProgress>(["LOADING"]);

    useEffect(() => {
        const handleMessage = async ({ data, origin }: MessageEvent) => {
            const { type } = data;
            if (typeof type !== "string" || origin !== window.location.origin) {
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
        };
        window.addEventListener("message", handleMessage);

        const cleanup = () => {
            clearInterval(disconnectionWatchdog);
            setProgress([
                "GOT_ERROR",
                new Error("popup was closed forcefully"),
            ]);
            removeState();
            window.removeEventListener("message", handleMessage);
        };

        const disconnectionWatchdog = setInterval(() => {
            const popupOpen = !popupRef.current?.window?.closed ?? false;
            if (popupOpen) {
                return;
            }
            cleanup();
        }, 1000);

        return cleanup;
    }, []);

    useEffect(() => {
        if (refresher === null) {
            return;
        }
        const abort = new AbortController();
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
        });
        const url = new URL(
            "/oauth2/authorize?" + params,
            "https://discord.com",
        );
        popupRef.current = openPopupInCenter(url, "discord-oauth2");
    }

    const loginButton = (
        <button
            className="bg-indigo-500 text-slate-100 p-4 rounded-2xl"
            onClick={handleLogin}
        >
            Discord でログイン
        </button>
    );

    switch (progress[0]) {
        case "LOADING":
            return loginButton;
        case "GOT_ERROR":
            return (
                <>
                    {loginButton}
                    <h2>ログインに失敗しました</h2>
                    <p>{progress[1].message}</p>
                </>
            );
        case "GOT_TOKEN":
            return <EditConsole token={progress[1]} />;
    }
};
