import { defineConfig } from "tsup";

export default defineConfig((options) => ({
    entry: ["src/index.ts", "src/cli.ts"],
    outDir: "dist",
    target: "node14",
    format: ["cjs", "esm"],
    clean: true,
    splitting: false,
    minify: false,
    platform: "node",
    dts: !options.watch,
}));
