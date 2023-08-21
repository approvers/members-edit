"use client";

import { openPopupInCenter } from "@/portal/popup";
import { GITHUB_CLIENT_ID } from "@/store/consts";
import { useRef } from "react";

export const useGitHubOAuth = (
    onFoundUser: (data: { id: number; login: string }) => void,
) => {
    const popupRef = useRef<Window | null>(null);

    function handleAddGitHubAccount() {
        const params = new URLSearchParams({
            client_id: GITHUB_CLIENT_ID,
        });
        popupRef.current = openPopupInCenter(
            new URL("https://github.com/login/oauth/authorize?" + params),
            "github-oauth2",
        );
    }

    return handleAddGitHubAccount;
};
