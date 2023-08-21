"use client";

import { useDiscordOAuth } from "@/hooks/discord";
import { EditConsole } from "./edit-console";

export const IndexClient = (): JSX.Element => {
    const [progress, handleLogin] = useDiscordOAuth();

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
