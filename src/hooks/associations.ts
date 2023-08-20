"use client";

import { useEffect, useState } from "react";

export type AssociationLink = {
    type: "github" | "twitter";
    id: string;
    name: string;
};

export type UseAssociationReturns =
    | [state: "LOADING"]
    | [state: "GOT", associations: readonly AssociationLink[]];

export const useAssociations = (token: string): UseAssociationReturns => {
    const [returns, setReturns] = useState<UseAssociationReturns>(["LOADING"]);

    useEffect(() => {
        const abort = new AbortController();
        (async () => {
            const meRes = await fetch("https://discord.com/api/v10/users/@me", {
                headers: {
                    Authorization: "Bearer " + token,
                },
                signal: abort.signal,
            });
            const { id: discordId } = await meRes.json();
            const associationsRes = await fetch(
                `https://members.approvers.dev/members/${discordId}/associations`,
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                    signal: abort.signal,
                },
            );
            if (!associationsRes.ok) {
                setReturns(["GOT", []]);
            }
            const associations = await associationsRes.json();
            setReturns(["GOT", associations]);
        })();

        return () => {
            abort.abort();
        };
    }, [token]);

    return returns;
};
