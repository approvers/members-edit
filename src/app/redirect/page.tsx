import { getState } from "@/store/state";
import { useEffect } from "react";

export default function Callback(): JSX.Element {
    useEffect(() => {
        const params = new URL(window.location.href).searchParams;
        const paramsMap = new Map(params.entries());
        const state = paramsMap.get("state");
        const error = paramsMap.get("error");
        const code = paramsMap.get("code");

        if (!window.opener) {
            console.error("not opened from popup");
            return;
        }
        if (error) {
            window.opener.postMessage({
                type: "ERROR",
                error: decodeURI(error),
            });
            return;
        }
        if (state !== getState()) {
            window.opener.postMessage({
                type: "ERROR",
                error: "state mismatch",
            });
            return;
        }
        window.opener.postMessage({
            type: "OK",
            code,
        });
        window.close();
    }, []);
    return (
        <main>
            <h1>画面遷移中…</h1>
        </main>
    );
}
