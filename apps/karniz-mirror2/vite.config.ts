import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: ".",
  publicDir: "public",
  appType: "mpa",
  resolve: {
    alias: {
      "@curtans-web": path.resolve(__dirname, "../web/src"),
    },
  },
  server: {
    port: 5175,
    strictPort: false,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        shtori: path.resolve(__dirname, "catalog/shtori/index.html"),
      },
    },
  },
});
