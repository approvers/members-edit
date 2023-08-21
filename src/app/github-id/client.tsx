"use client";

import { useEffect } from "react";

export const GitHubCallbackClient = (): JSX.Element => {
    useEffect(() => {
        const code = new URL(window.location.href).searchParams.get("code");

        if (!window.opener) {
            console.error("opener unavailable");
            return;
        }
        window.opener.postMessage({
            type: "OK",
            code,
        });
        window.close();
    }, []);

    return <h1>遷移中…</h1>;
};
