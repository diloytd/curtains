import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@curtans-web": path.resolve(__dirname, "../web/src"),
    },
  },
  server: {
    port: 5176,
    strictPort: false,
  },
});
