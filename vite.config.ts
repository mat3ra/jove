import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

/**
 * Vite config for the jove standalone demo app.
 *
 * This is ONLY used for local development (`npm run dev`) and
 * the standalone bundle (`npm run build:standalone`).
 * The library build (tsc) ignores this file entirely.
 */
export default defineConfig({
    base: "/jove/",
    plugins: [
        react({
            jsxImportSource: "@emotion/react",
            babel: {
                plugins: ["@emotion/babel-plugin"],
            },
        }),
        nodePolyfills(),
    ],
    define: {
        __dirname: JSON.stringify(__dirname),
    },
    resolve: {
        dedupe: [
            "react",
            "react-dom",
            "@emotion/react",
            "@emotion/styled",
            "@mui/material",
            "@mui/styles",
            "@mat3ra/made",
        ],
        alias: [
            // Self-referencing alias so the standalone demo can import from
            // "@mat3ra/jove" and resolve to the local source tree.
            {
                find: /^@mat3ra\/jove$/,
                replacement: path.resolve(__dirname, "src/exports.ts"),
            },
            {
                find: /^@mat3ra\/jove\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "src/$1"),
            },
            // @mat3ra/prode — resolve subpath imports to installed dist.
            {
                find: /^@mat3ra\/prode\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/@mat3ra/prode/dist/$1"),
            },
            // @mat3ra/job-designer — stub until the package is published on npm.
            {
                find: /^@mat3ra\/job-designer$/,
                replacement: path.resolve(__dirname, "src/standalone/stubs/job-designer.js"),
            },
            // Stub for moment-duration-format (used by ive/ave compute components).
            {
                find: "moment-duration-format",
                replacement: path.resolve(__dirname, "src/standalone/stubs/moment-duration-format.js"),
            },
            // use-sync-external-store extension fix (MUI relies on named export).
            {
                find: "use-sync-external-store/shim/with-selector.js",
                replacement: "use-sync-external-store/shim/with-selector",
            },
            // @mui subpath CJS → ESM fixes.
            {
                find: /^@mui\/system\/(?!esm\/)(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/@mui/system/esm/$1"),
            },
            {
                find: /^@mui\/icons-material\/(?!esm\/)(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/@mui/icons-material/esm/$1"),
            },
            // lodash → lodash-es for tree-shaking.
            {
                find: /^lodash\/(?!es\/)(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/lodash-es/$1.js"),
            },
        ],
    },
    build: {
        outDir: "build",
        rollupOptions: {
            output: {
                entryFileNames: "main.js",
                chunkFileNames: "[name]-[hash].js",
                assetFileNames: "[name]-[hash].[ext]",
            },
        },
    },
    server: {
        port: 3008,
    },
});
