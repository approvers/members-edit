"use client";

import { AssociationLink, useAssociations } from "@/hooks/associations";
import { useReducer, useState } from "react";
import { nextState } from "./reducer";
import { FaGithub, FaTwitter } from "react-icons/fa";
import { MdDelete, MdOpenInNew } from "react-icons/md";
import { useTwitterOAuth } from "@/hooks/twitter";
import { useGitHubOAuth } from "@/hooks/github";

const AccountIcon = ({ type }: { type: "github" | "twitter" }): JSX.Element =>
    ({
        github: <FaGithub />,
        twitter: <FaTwitter />,
    })[type];

const AccountList = ({
    list,
    onRemove,
}: {
    list: readonly AssociationLink[];
    onRemove: (index: number) => void;
}): JSX.Element =>
    list.length === 0 ? (
        <p>関連付けられたアカウントはありません</p>
    ) : (
        <ol>
            {list.map(({ type, id, name }, index) => (
                <li key={`${type}-${id}`} className="flex items-center gap-4">
                    <AccountIcon type={type} />
                    <a
                        href={`https://${type}.com/${name}`}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        rel="noopener noreferrer"
                        className="flex items-end"
                    >
                        <span className="text-xl underline">{name}</span>
                        <MdOpenInNew />
                    </a>
                    <button
                        onClick={() => {
                            onRemove(index);
                        }}
                    >
                        <MdDelete className="text-red-400" />
                    </button>
                </li>
            ))}
        </ol>
    );

const EditableList = ({
    defaultList,
    onSave,
}: {
    defaultList: readonly AssociationLink[];
    onSave: (newList: readonly AssociationLink[]) => Promise<void>;
}) => {
    const [saving, setSaving] = useState(false);
    const [state, dispatch] = useReducer(nextState, { links: defaultList });
    const handleAddTwitterAccount = useTwitterOAuth(({ id, username }) => {
        dispatch({
            type: "ADD_LINK",
            link: { type: "twitter", id, name: username },
        });
    });
    const handleAddGitHubAccount = useGitHubOAuth(({ id, login }) => {
        dispatch({
            type: "ADD_LINK",
            link: { type: "github", id: id.toString(), name: login },
        });
    });

    function handleSave() {
        setSaving(true);
        onSave(state.links).then(() => {
            setSaving(false);
        });
    }

    function handleRemove(index: number) {
        dispatch({
            type: "REMOVE_LINK",
            index,
        });
    }

    return (
        <>
            <AccountList list={state.links} onRemove={handleRemove} />
            <div className="flex gap-8">
                <button
                    className="bg-cyan-400 text-slate-100 p-4 rounded-2xl"
                    onClick={handleAddTwitterAccount}
                >
                    Twitter アカウントを追加
                </button>
                <button
                    className="bg-slate-800 text-slate-100 p-4 rounded-2xl"
                    onClick={handleAddGitHubAccount}
                >
                    GitHub アカウントを追加
                </button>
                <button
                    className="bg-slate-700 disabled:blur-sm text-slate-100 p-4 rounded-2xl"
                    onClick={handleSave}
                    disabled={saving}
                >
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

    async function handleSave(newList: readonly AssociationLink[]) {
        const discordMeRes = await fetch(
            "https://discord.com/api/v10/users/@me",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
        const { id: discordId } = await discordMeRes.json();

        const res = await fetch(
            `https://members.approvers.dev/members/${discordId}/associations`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newList),
            },
        );
        if (!res.ok) {
            console.error(await res.text());
        }
    }

    return <EditableList defaultList={list} onSave={handleSave} />;
};
