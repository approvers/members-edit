"use client";

import { getState } from "@/store/state";
import { useEffect } from "react";

export const RedirectClient = (): JSX.Element => {
    useEffect(() => {
        const params = new URL(window.location.href).searchParams;
        const paramsMap = new Map(params.entries());
        const state = paramsMap.get("state");
        const error = paramsMap.get("error");
        const code = paramsMap.get("code");

        const tx = new BroadcastChannel("twitter-oauth-code-channel");
        if (error) {
            tx.postMessage({
                type: "ERROR",
                error: decodeURI(error),
            });
            return;
        }
        if (state !== getState()) {
            tx.postMessage({
                type: "ERROR",
                error: "state mismatch",
            });
            return;
        }
        tx.postMessage({
            type: "OK",
            code,
        });
    }, []);

    return <h1>画面遷移中…</h1>;
};
