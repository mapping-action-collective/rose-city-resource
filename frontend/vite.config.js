import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { join } from "node:path";
import { buildSync } from "esbuild";
import { defineConfig } from "vite";

export default defineConfig({
  root: __dirname,
  build: {
    outDir: "dist/apps/rcr",
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  cacheDir: "node_modules/.vite/rcr",
  server: {
    port: 3000,
    host: "localhost",
    proxy: {
      "/api": {
        target: "http://localhost:5900/",
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/app/, "")
      }
    },
    "/socket.io": {
      target: "ws://localhost:3000",
      ws: true
    }
  },

  preview: {
    port: 3001,
    host: "localhost"
  },

  plugins: [
    react(),
    svgr({
      include: "**/*.svg?react"
    }),
    {
      apply: "build",
      enforce: "post",
      transformIndexHtml() {
        buildSync({
          minify: true,
          bundle: true,
          entryPoints: [join(process.cwd(), "serviceWorker.js")],
          outfile: join(process.cwd(), "dist", "serviceWorker.js")
        });
      }
    }
  ]
});
