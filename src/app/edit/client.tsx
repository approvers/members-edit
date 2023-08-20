"use client";

import { useAssociations } from "@/hooks/associations";
import { useOAuth } from "@/hooks/discord-oauth";

const EditConsole = ({ token }: { token: string }): JSX.Element => {
    const associations = useAssociations(token);

    switch (associations[0]) {
        case "LOADING":
            return <h1>読み込み中…</h1>;
    }
    const list = associations[1];
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-xl font-bold">Approvers メンバー情報編集</h1>
            {list.length === 0 ? (
                <p>関連付けられたアカウントはありません</p>
            ) : (
                <ol>
                    {list.map(({ type, id, name }) => (
                        <li key={`${type}-${id}`}>
                            <span>{type}</span>
                            <span>{name}</span>
                        </li>
                    ))}
                </ol>
            )}
            <div className="flex gap-8">
                <button className="">アカウントを追加</button>
                <button className="">保存</button>
            </div>
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
