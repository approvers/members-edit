"use client";

import { useAssociations } from "@/hooks/associations";
import { useOAuth } from "@/hooks/discord-oauth";

const EditConsole = ({ token }: { token: string }): JSX.Element => {
    const associations = useAssociations(token);

    switch (associations[0]) {
        case "LOADING":
            return <h1>読み込み中…</h1>;
    }
    return (
        <main>
            <ol>
                {associations[1].map(({ type, id, name }) => (
                    <li key={`${type}-${id}`}>
                        <span>{type}</span>
                        <span>{name}</span>
                    </li>
                ))}
            </ol>
        </main>
    );
};

export const EditLogin = (): JSX.Element => {
    const oauth = useOAuth();
    switch (oauth[0]) {
        case "LOADING":
            return (
                <main>
                    <h1>ログイン中…</h1>
                    <p>
                        ログイン認証ウインドウのポップアップを許可してください
                    </p>
                </main>
            );
        case "GOT_ERROR":
            console.error(oauth[1]);
            return (
                <main>
                    <h1>エラーが発生しました</h1>
                    <p>{oauth[1].message}</p>
                </main>
            );
        case "GOT_TOKEN":
            return <EditConsole token={oauth[1]} />;
    }
};
