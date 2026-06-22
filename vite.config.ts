import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindCss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        tailwindCss(),
        cloudflare({
            viteEnvironment: {
                name: "ssr",
            },
        }),
        !process.env.VITEST ? reactRouter() : react(),
    ],
    resolve: {
        tsconfigPaths: true,
    },
    server: {
        port: 3000,
    },
});
