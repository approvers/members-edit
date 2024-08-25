import {
    vitePlugin as remix,
    cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        remixCloudflareDevProxy(),
        !process.env.VITEST ? remix() : react(),
    ],
    server: {
        port: 3000,
    },
});
