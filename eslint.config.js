import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
    { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
        },
    },
];