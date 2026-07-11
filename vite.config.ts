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
 *
 * Kept in sync with the canonical @mat3ra/ave / @mat3ra/ive / @mat3ra/wove
 * configs: minimal dedupe, no optimizeDeps overrides, and NO stubs for the
 * @mat3ra/* data packages. The standalone demo renders jove's own components
 * (ResultsTab) plus lightweight package-native tab viewers — it does NOT embed
 * @mat3ra/job-designer, so none of that package's Meteor/simple-react-form/
 * reactflow chain is pulled in. The webapp injects the full job-designer.
 * The only genuine stub is moment-duration-format (a server-oriented module
 * ave's chain also shims).
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
    optimizeDeps: {
        include: ["moment", "moment-duration-format", "@mat3ra/jode"],
    },
    server: {
        port: 3008,
    },
    resolve: {
        dedupe: ["@mat3ra/esse", "@mui/material", "@mui/styles", "@emotion/react", "@emotion/styled"],
        alias: [
            {
                find: /^moment$/,
                replacement: path.resolve(__dirname, "node_modules/moment/moment.js"),
            },
            {
                find: /^vite-plugin-node-polyfills\/shims\/(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/vite-plugin-node-polyfills/shims/$1"),
            },
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
            // @mat3ra/prode — its package.json `exports` map only exposes "." and
            // "./types". Resolve any deep subpath imports straight to the real dist
            // files. NOT a stub — real code.
            {
                find: /^@mat3ra\/prode\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/@mat3ra/prode/dist/$1"),
            },
            // MUI ESM fixes.
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
});
