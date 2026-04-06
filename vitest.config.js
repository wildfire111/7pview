import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { transformWithOxc } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        // vite:oxc (Vite 6) fails on JSX in .js files — pre-transform them first
        {
            name: "treat-js-files-as-jsx",
            enforce: "pre",
            async transform(code, id) {
                if (!id.includes("/node_modules/") && id.endsWith(".js") && id.includes("/src/")) {
                    return transformWithOxc(code, id, { lang: "jsx", jsx: { runtime: "automatic", importSource: "react" } });
                }
            },
        },
        react(),
    ],
    test: {
        environment: "node",
        globals: true,
        setupFiles: ["./src/test-setup.js"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
