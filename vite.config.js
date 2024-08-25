import {
    cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
    vitePlugin as remix,
} from "@remix-run/dev";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        remixCloudflareDevProxy(),
        !process.env.VITEST ? remix() : react(),
    ],
    server: {
        port: 3000,
    },
});
