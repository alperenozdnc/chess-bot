import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    resolve: {
        alias: {
            "@constants": resolve(__dirname, "src/constants"),
            "@enums": resolve(__dirname, "src/enums"),
            "@types": resolve(__dirname, "src/types"),
            "@interfaces": resolve(__dirname, "src/interfaces"),
            "@functions": resolve(__dirname, "src/functions"),
            "@utils": resolve(__dirname, "src/utils"),
            "@maps": resolve(__dirname, "src/maps"),
            "@testing": resolve(__dirname, "src/testing"),
        },
    },
    server: {
        open: true, // automatically opens browser
    },
    build: {
        outDir: "dist",
        sourcemap: true,
    },
});
