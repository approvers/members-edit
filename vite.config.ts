import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import tailwindCss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        tailwindCss(),
        cloudflareDevProxy(),
        !process.env.VITEST ? reactRouter() : react(),
    ],
    resolve: {
        tsconfigPaths: true,
    },
    server: {
        port: 3000,
    },
});
