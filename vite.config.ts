import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

/**
 * Vite config for the jove package.
 *
 * When running as a standalone demo app (`npm run dev`), the full module graph
 * is resolved.  Aliases below ensure the standalone Vite server works without
 * the full Meteor environment.
 *
 * The `build` target (`npm run build`) continues to emit the transpiled
 * library to `build/`.
 */
export default defineConfig({
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
            "@mui/system",
            "@mui/lab",
            "@mui/icons-material",
            "@mui/utils",
            "@mui/base",
        ],
        alias: [
            // @exabyte-io/cove.js — point all subpath imports to the local
            // reference/cove.js/dist so any version skew is avoided.
            {
                find: /^@exabyte-io\/cove\.js\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../cove.js/dist/$1"),
            },
            {
                find: /^@exabyte-io\/cove\.js$/,
                replacement: path.resolve(__dirname, "../cove.js/dist/index.js"),
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
            // @mat3ra/prove — point to the local reference build.
            {
                find: /^@mat3ra\/prove$/,
                replacement: path.resolve(__dirname, "../prove/src/exports.ts"),
            },
            {
                find: /^@mat3ra\/prove\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../prove/src/$1"),
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
            // Catch-all for any remaining /imports/* Meteor paths that may be
            // transitively pulled in via peer packages.
            {
                find: /^\/imports\/(.*)$/,
                replacement: path.resolve(__dirname, "src/standalone/stubs/meteor.js"),
            },
            {
                find: /^meteor\/(.*)$/,
                replacement: path.resolve(__dirname, "src/standalone/stubs/meteor.js"),
            },
        ],
    },
    optimizeDeps: {
        exclude: ["@exabyte-io/cove.js"],
        include: [
            "react",
            "react-dom",
            "prop-types",
            "lodash",
            "underscore",
            "underscore.string",
            "underscore.string/capitalize",
            "mixwith",
            "react-error-boundary",
            "flat",
            "simpl-schema",
            "d3-hierarchy",
            "@mui/material",
            "@mui/system",
            "@mui/lab",
            "@mui/icons-material",
            "@rjsf/mui",
            "@rjsf/utils",
            "@rjsf/validator-ajv8",
            "react-is",
            "hoist-non-react-statics",
            "ajv",
            "ajv/dist/ajv",
            "@mat3ra/code/dist/js/utils",
            "@mat3ra/code/dist/js/utils/object",
            "@mat3ra/code/dist/js/utils/schemas",
            "@mat3ra/prode",
            "@mat3ra/made",
            "@mat3ra/ade",
            "@mat3ra/utils",
            "@mat3ra/standata",
            "@mat3ra/wode",
            "@mat3ra/mode",
            "@mat3ra/code",
            "@mat3ra/esse",
            "@exabyte-io/periodic-table.js",
            "react-json-view",
            "use-sync-external-store/shim/with-selector",
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
