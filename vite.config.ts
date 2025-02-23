import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import { reactRouter } from "@react-router/dev/vite";
import tailwindCss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [
        tailwindCss(),
        cloudflareDevProxy(),
        !process.env.VITEST ? reactRouter() : react(),
        tsconfigPaths(),
    ],
    server: {
        port: 3000,
    },
});
