import {
    cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
    vitePlugin as remix,
} from "@remix-run/dev";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [
        remixCloudflareDevProxy(),
        !process.env.VITEST ? remix() : react(),
        tsconfigPaths(),
    ],
    server: {
        port: 3000,
    },
});
