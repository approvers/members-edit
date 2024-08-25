import { Links, Meta, Outlet, Scripts } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/cloudflare";
import stylesheet from "./tailwind.css?url";
import favicon from "./favicon.ico?url";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: stylesheet },
    { rel: "icon", href: favicon },
];

export default function App() {
    return (
        <html lang="ja">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body>
                <Outlet />
                <Scripts />
            </body>
        </html>
    );
}
