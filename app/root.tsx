import React from "react";
import "./tailwind.css";

import { Links, Meta, Outlet, Scripts } from "react-router";

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
