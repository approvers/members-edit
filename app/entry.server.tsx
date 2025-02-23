import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { type EntryContext, ServerRouter } from "react-router";

export default async function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext,
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
