import { removeState, saveState } from "@/store/state";
import { useEffect, useRef, useState } from "react";

const newState = () => {
    const alphaNum =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const array = new Uint8Array(40);
    crypto.getRandomValues(array);
    return String.fromCharCode(
        ...[...array.values()].map(
            (index) => alphaNum.codePointAt(index % alphaNum.length)!,
        ),
    );
};

const openAuthorizationPopup = (state: string) => {
    const params = new URLSearchParams({
        client_id: "1141210184505639003",
        redirect_uri: encodeURIComponent(
            new URL("/redirect", window.location.href).toString(),
        ),
        response_type: "code",
        scope: "identify guilds.members.read",
        state,
    });
    const url = new URL(
        "/api/v10/oauth2/authorize?" + params,
        "https://discord.com",
    );
    return window.open(url, "_blank");
};

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
        const state = newState();
        saveState(state);
        popupRef.current = openAuthorizationPopup(state);

        const handleMessage = async ({ data }: MessageEvent) => {
            const { type } = data;
            if (typeof type !== "string") {
                console.error("invalid message");
                console.dir(data);
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
            const response: TokenResponse = await (
                await fetch("/api/token", {
                    body: JSON.stringify({ code }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
            ).json();
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
            clearInterval(disconnectionWatchdog);
            window.removeEventListener("message", handleMessage);
            removeState();
        };
    }, []);

    useEffect(() => {
        if (refresher === null) {
            return;
        }
        const refreshTimer = setTimeout(async () => {
            const response: TokenResponse = await (
                await fetch("/api/refresh", {
                    body: JSON.stringify({
                        refreshToken: refresher.refreshToken,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
            ).json();
            setRefresher({
                refreshToken: response.refresh_token,
                expiresIn: response.expires_in,
            });
            setReturns(["GOT_TOKEN", response.access_token]);
        }, refresher.expiresIn * 1000);
        return () => {
            clearTimeout(refreshTimer);
        };
    }, [refresher]);

    return returns;
};
