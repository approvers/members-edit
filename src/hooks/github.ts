"use client";

import { openPopupInCenter } from "@/portal/popup";
import { GITHUB_CLIENT_ID } from "@/store/consts";
import { useEffect, useRef } from "react";

export const useGitHubOAuth = (
    onFoundUser: (data: { id: number; login: string }) => void,
) => {
    const popupRef = useRef<Window | null>(null);

    useEffect(() => {
        const rx = new BroadcastChannel("github-oauth-code-channel");
        rx.addEventListener("message", async ({ origin, data }) => {
            const { type } = data;
            if (typeof type !== "string" || origin !== window.location.origin) {
                return;
            }

            const { code, error } = data;
            if (type === "ERROR") {
                console.error(error);
                popupRef.current?.close();
                return;
            }
            if (typeof code !== "string") {
                console.dir(data);
                throw new Error("invalid data");
            }
            const tokenRes = await fetch("/github-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code }),
            });
            if (!tokenRes.ok) {
                console.error(await tokenRes.text());
                return;
            }
            const { access_token } = await tokenRes.json();
            const meRes = await fetch("/github-me", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
            if (!meRes.ok) {
                console.error(await meRes.text());
                return;
            }
            const me = await meRes.json();
            onFoundUser(me);
            popupRef.current?.close();
        });
    }, [onFoundUser]);

    function handleAddGitHubAccount() {
        const params = new URLSearchParams({
            client_id: GITHUB_CLIENT_ID,
            redirect_uri: new URL(
                "/github-id",
                window.location.href,
            ).toString(),
        });
        popupRef.current = openPopupInCenter(
            new URL("https://github.com/login/oauth/authorize?" + params),
            "github-oauth2",
        );
    }

    return handleAddGitHubAccount;
};
