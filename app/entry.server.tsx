import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import {
    ServerRouter,
    type AppLoadContext,
    type EntryContext,
} from "react-router";
import React from "react";

export default async function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext,
    _loadContext: AppLoadContext,
) {
    let resCode = responseStatusCode;
    let shellRendered = false;
    const userAgent = request.headers.get("user-agent");

    const body = await renderToReadableStream(
        <ServerRouter context={routerContext} url={request.url} />,
        {
            onError(error: unknown) {
                resCode = 500;
                if (shellRendered) {
                    console.error(error);
                }
            },
        },
    );
    shellRendered = true;

    if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
        await body.allReady;
    }

    responseHeaders.set("Content-Type", "text/html");
    return new Response(body, {
        headers: responseHeaders,
        status: resCode,
    });
}
