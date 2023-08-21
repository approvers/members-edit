"use client";

import { useEffect } from "react";

export const GitHubCallbackClient = (): JSX.Element => {
    useEffect(() => {
        const code = new URL(window.location.href).searchParams.get("code");

        const tx = new BroadcastChannel("github-oauth-code-channel");
        tx.postMessage({
            type: "OK",
            code,
        });
    }, []);

    return <h1>遷移中…</h1>;
};
