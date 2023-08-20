"use client";

import { openPopupInCenter } from "@/portal/popup";
import { DISCORD_CLIENT_ID } from "@/store/consts";
import { removeState, saveState } from "@/store/state";
import { generate } from "randomstring";
import { useEffect, useRef, useState } from "react";

type TokenResponse = {
    access_token: string;
    token_type: "Bearer";
    expires_in: number;
    refresh_token: string;
    scope: string;
};

export type UseOAuthReturns =
    | [state: "LOADING"]
    | [state: "GOT_TOKEN", token: string]
    | [state: "GOT_ERROR", error: Error];

export const useOAuth = (): UseOAuthReturns => {
    const popupRef = useRef<Window | null>(null);
    const [refresher, setRefresher] = useState<{
        refreshToken: string;
        expiresIn: number;
    } | null>(null);
    const [returns, setReturns] = useState<UseOAuthReturns>(["LOADING"]);

    useEffect(() => {
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
        popupRef.current = openPopupInCenter(url);

        const handleMessage = async ({ data, origin }: MessageEvent) => {
            const { type } = data;
            if (typeof type !== "string" || origin !== window.location.origin) {
                return;
            }
            if (type === "ERROR") {
                setReturns(["GOT_ERROR", data.error]);
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
            const response: TokenResponse = await tokenRes.json();
            setRefresher({
                refreshToken: response.refresh_token,
                expiresIn: response.expires_in,
            });
            setReturns(["GOT_TOKEN", response.access_token]);
        };
        window.addEventListener("message", handleMessage);

        const disconnectionWatchdog = setInterval(() => {
            const popupOpen = !popupRef.current?.window?.closed ?? false;
            if (popupOpen) {
                return;
            }
            clearInterval(disconnectionWatchdog);
            setReturns(["GOT_ERROR", new Error("popup was closed forcefully")]);
            removeState();
            window.removeEventListener("message", handleMessage);
        }, 1000);

        return () => {
            if (popupRef.current) {
                popupRef.current.close();
                popupRef.current = null;
            }
            clearInterval(disconnectionWatchdog);
            window.removeEventListener("message", handleMessage);
            removeState();
        };
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
            const response: TokenResponse = await refreshRes.json();
            setRefresher({
                refreshToken: response.refresh_token,
                expiresIn: response.expires_in,
            });
            setReturns(["GOT_TOKEN", response.access_token]);
        }, refresher.expiresIn * 1000);
        return () => {
            clearTimeout(refreshTimer);
            abort.abort();
        };
    }, [refresher]);

    return returns;
};
