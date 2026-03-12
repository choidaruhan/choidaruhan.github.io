import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import fs from "fs";

export default defineConfig({
  base: process.env.GH_PAGES_BASE || "/",
  plugins: [
    svelte(),
    {
      name: 'copy-index-to-404',
      closeBundle() {
        if (fs.existsSync('docs/index.html')) {
          fs.copyFileSync('docs/index.html', 'docs/404.html');
          console.log('\n✅ docs/index.html successfully copied to docs/404.html');
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "$core": path.resolve(__dirname, "src/core"),
    },
  },
  build: {
    outDir: "docs",
    emptyOutDir: true,
    sourcemap: false,
    target: "es2022",
  },
  server: {
    fs: {
      allow: ["."],
    },
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://localhost:8787",
        changeOrigin: true,
      }
    },
  },
});
