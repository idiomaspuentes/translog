// Standalone Vite config for Storybook ONLY.
// Bypasses the project's vite.config.ts (which loads TanStack Start +
// Cloudflare plugins that hijack Storybook's build output).
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
});
