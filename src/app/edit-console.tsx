"use client";

import { AssociationLink, useAssociations } from "@/hooks/associations";
import { useReducer } from "react";
import { nextState } from "./reducer";
import { FaGithub, FaTwitter } from "react-icons/fa/";
import { useTwitterOAuth } from "@/hooks/twitter";

const AccountIcon = ({ type }: { type: "github" | "twitter" }): JSX.Element =>
    ({
        github: <FaGithub />,
        twitter: <FaTwitter />,
    })[type];

const AccountList = ({
    list,
}: {
    list: readonly AssociationLink[];
}): JSX.Element =>
    list.length === 0 ? (
        <p>関連付けられたアカウントはありません</p>
    ) : (
        <ol>
            {list.map(({ type, id, name }) => (
                <li key={`${type}-${id}`} className="flex items-center gap-4">
                    <AccountIcon type={type} />
                    <span className="text-xl">{name}</span>
                </li>
            ))}
        </ol>
    );

const EditableList = ({
    defaultList,
}: {
    defaultList: readonly AssociationLink[];
}) => {
    const [state, dispatch] = useReducer(nextState, { links: defaultList });
    const handleAddTwitterAccount = useTwitterOAuth(dispatch);

    return (
        <>
            <AccountList list={state.links} />
            <div className="flex gap-8">
                <button
                    className="bg-cyan-400 text-slate-100 p-4 rounded-2xl"
                    onClick={handleAddTwitterAccount}
                >
                    Twitter アカウントを追加
                </button>
                <button className="bg-slate-700 text-slate-100 p-4 rounded-2xl">
                    保存
                </button>
            </div>
        </>
    );
};

export const EditConsole = ({ token }: { token: string }): JSX.Element => {
    const associations = useAssociations(token);

    if (associations[0] === "LOADING") {
        return <h1>読み込み中…</h1>;
    }
    const list = associations[1];

    return <EditableList defaultList={list} />;
};
