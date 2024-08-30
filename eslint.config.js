import pluginJs from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import reactJSXRuntime from "eslint-plugin-react/configs/jsx-runtime.js";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
    { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
    { ignores: ["build/"] },
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ...reactRecommended,
        ...reactJSXRuntime,
        rules: {
            ...reactRecommended.rules,
            ...reactJSXRuntime.rules,
        },
        languageOptions: {
            ...reactRecommended.languageOptions,
            ...reactJSXRuntime.languageOptions,
        },
        settings: {
            react: {
                version: "detect",
            },
            formComponents: ["Form"],
            linkComponents: [
                { name: "Link", linkAttribute: "to" },
                { name: "NavLink", linkAttribute: "to" },
            ],
        },
    },
    {
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
        },
    },
    eslintPluginPrettierRecommended,
];
