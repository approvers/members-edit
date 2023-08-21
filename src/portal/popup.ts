"use client";

export const openPopupInCenter = (url: URL, target: string) => {
    const POPUP_WIDTH = 600;
    const POPUP_HEIGHT = 600;
    const top = window.outerHeight / 2 + window.screenY - POPUP_HEIGHT / 2;
    const left = window.outerWidth / 2 + window.screenX - POPUP_WIDTH / 2;
    return window.open(
        url,
        target,
        `popup,height=${POPUP_HEIGHT},width=${POPUP_WIDTH},top=${top},left=${left}`,
    );
};
