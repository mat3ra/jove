import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

/**
 * Vite config for the jove package.
 *
 * When running as a standalone demo app (`npm run dev`), the full module graph
 * is resolved. Aliases below ensure the standalone Vite server works without
 * the full Meteor environment. The alias list mirrors job-designer's vite.config.ts
 * since jove's standalone reuses JobLocalReduxContainer from job-designer.
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
            "@mat3ra/made",
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
            // cove.js src/* — ThreeDEditor from wave.js imports AlertProvider via the /src/ path.
            {
                find: /^@exabyte-io\/cove\.js\/src\/(.*)$/,
                replacement: path.resolve(__dirname, "../cove.js/src/$1"),
            },
            // @exabyte-io/wave.js — not installed in jove; alias to job-designer's copy.
            {
                find: /^@exabyte-io\/wave\.js$/,
                replacement: path.resolve(
                    __dirname,
                    "../job-designer/node_modules/@exabyte-io/wave.js/dist/exports.js",
                ),
            },
            // @mat3ra/prode — use installed dist (prode has no local reference source).
            {
                find: /^@mat3ra\/prode\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/@mat3ra/prode/dist/$1"),
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
            // @mat3ra/wove — local reference source (avoids /imports/ in dist).
            {
                find: /^@mat3ra\/wove$/,
                replacement: path.resolve(__dirname, "../wove/src/exports.ts"),
            },
            {
                find: /^@mat3ra\/wove\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../wove/src/$1"),
            },
            // @mat3ra/ave — local reference source.
            {
                find: /^@mat3ra\/ave$/,
                replacement: path.resolve(__dirname, "../ave/src/exports.ts"),
            },
            {
                find: /^@mat3ra\/ave\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../ave/src/$1"),
            },
            // @mat3ra/ive — local reference source.
            {
                find: /^@mat3ra\/ive$/,
                replacement: path.resolve(__dirname, "../ive/src/exports.ts"),
            },
            {
                find: /^@mat3ra\/ive\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../ive/src/$1"),
            },
            // @mat3ra/move — local reference source.
            {
                find: /^@mat3ra\/move$/,
                replacement: path.resolve(__dirname, "../move/src/exports.ts"),
            },
            {
                find: /^@mat3ra\/move\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../move/src/$1"),
            },
            // @mat3ra/prove — local reference source.
            {
                find: /^@mat3ra\/prove$/,
                replacement: path.resolve(__dirname, "../prove/src/exports.ts"),
            },
            {
                find: /^@mat3ra\/prove\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../prove/src/$1"),
            },
            // @mat3ra/job-designer — local reference source.
            {
                find: /^@mat3ra\/job-designer$/,
                replacement: path.resolve(__dirname, "../job-designer/src/exports.ts"),
            },
            {
                find: /^@mat3ra\/job-designer\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../job-designer/src/$1"),
            },
            // @mat3ra/jode — job data layer (used by job-designer).
            {
                find: /^@mat3ra\/jode$/,
                replacement: path.resolve(__dirname, "../jode/src/js/index.ts"),
            },
            {
                find: /^@mat3ra\/jode\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../jode/src/$1"),
            },
            // @mat3ra/made — use jove's own installed node_modules (no alias needed).
            // Deduplicated above to prevent double instances from job-designer's copy.
            // Aliased explicitly so files outside jove's root (wove, prove) can resolve it.
            {
                find: /^@mat3ra\/made$/,
                replacement: path.resolve(__dirname, "node_modules/@mat3ra/made/dist/js/made.js"),
            },
            // @mat3ra/workflow-designer — local reference source.
            {
                find: /^@mat3ra\/ide\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../job-designer/node_modules/@mat3ra/ide/dist/$1"),
            },
            {
                find: /^@mat3ra\/ide$/,
                replacement: path.resolve(__dirname, "../job-designer/node_modules/@mat3ra/ide"),
            },
            // @mat3ra/workflow-designer — local reference source.
            {
                find: /^@mat3ra\/workflow-designer$/,
                replacement: path.resolve(__dirname, "../workflow-designer/src/exports.ts"),
            },
            {
                find: /^@mat3ra\/workflow-designer\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../workflow-designer/src/$1"),
            },
            // Catch-all for any remaining /imports/* Meteor paths.
            {
                find: /^\/imports\/(.*)$/,
                replacement: path.resolve(__dirname, "src/standalone/stubs/meteor.js"),
            },
            {
                find: /^meteor\/(.*)$/,
                replacement: path.resolve(__dirname, "src/standalone/stubs/meteor.js"),
            },
            // simple-react-form stub (used by workflow-designer's MapDataForm).
            {
                find: "simple-react-form",
                replacement: path.resolve(__dirname, "src/standalone/stubs/simple-react-form.js"),
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
            // react / react-dom — jove has no local install; point to workflow-designer's copy
            // so all packages resolve to the same instance (satisfying dedupe).
            {
                find: /^react\/jsx-dev-runtime$/,
                replacement: path.resolve(__dirname, "../workflow-designer/node_modules/react/jsx-dev-runtime.js"),
            },
            {
                find: /^react\/jsx-runtime$/,
                replacement: path.resolve(__dirname, "../workflow-designer/node_modules/react/jsx-runtime.js"),
            },
            {
                find: /^react-dom\/client$/,
                replacement: path.resolve(__dirname, "../workflow-designer/node_modules/react-dom/client.js"),
            },
            {
                find: /^react-dom$/,
                replacement: path.resolve(__dirname, "../workflow-designer/node_modules/react-dom/index.js"),
            },
            {
                find: /^react$/,
                replacement: path.resolve(__dirname, "../workflow-designer/node_modules/react/index.js"),
            },
            // redux / react-redux — use job-designer's installed copies (jove has none).
            {
                find: /^redux$/,
                replacement: path.resolve(__dirname, "../job-designer/node_modules/redux/dist/redux.js"),
            },
            {
                find: /^react-redux$/,
                replacement: path.resolve(__dirname, "../job-designer/node_modules/react-redux/dist/react-redux.js"),
            },
            {
                find: /^redux-logger$/,
                replacement: path.resolve(__dirname, "../job-designer/node_modules/redux-logger/dist/redux-logger.js"),
            },
        ],
    },
    optimizeDeps: {
        exclude: [
            "@exabyte-io/cove.js",
            "@mat3ra/prove",
            "@mat3ra/jove",
            "@mat3ra/job-designer",
            "@mat3ra/jode",
            "@mat3ra/ive",
            "@mat3ra/ave",
            "@mat3ra/wove",
            "@mat3ra/move",
            "@mat3ra/workflow-designer",
        ],
        esbuildOptions: {
            // Vite resolve.alias does NOT apply during esbuild pre-bundling.
            // This alias tells esbuild where to find the dep that @mat3ra/wode
            // requires CJS-style so pre-bundling succeeds.
            alias: {
                "@mat3ra/ide/dist/js/compute": "../job-designer/node_modules/@mat3ra/ide/dist/js/compute.js",
            },
        },
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
        fs: {
            // Allow Vite to serve files from aliased sibling packages that live
            // outside of this package's own directory.
            allow: [
                path.resolve(__dirname, ".."),
                path.resolve(__dirname, "../job-designer/node_modules"),
            ],
        },
    },
});
