import { defineConfig, type HmrOptions } from "vite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

if (
  process.env.npm_lifecycle_event === "build" &&
  !process.env.CI &&
  !process.env.SHOPIFY_API_KEY
) {
  throw new Error(
    "\n\nThe frontend build will not work without an API key. Set the SHOPIFY_API_KEY environment variable when running the build command, for example:" +
      "\n\nSHOPIFY_API_KEY=<your-api-key> npm run build\n"
  );
}

process.env.VITE_SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;

// Parse numeric ports from env vars (process.env values are strings)
const FRONTEND_PORT = process.env.FRONTEND_PORT
  ? parseInt(process.env.FRONTEND_PORT, 10)
  : undefined; // undefined lets Vite auto-select a port

// BACKEND_PORT used only in a URL string — keep it as a string with a sensible default:
const BACKEND_PORT = process.env.BACKEND_PORT ?? "3000";

const proxyOptions = {
  target: `http://127.0.0.1:${BACKEND_PORT}`,
  changeOrigin: false,
  secure: true,
  ws: false,
};

const host = process.env.HOST
  ? process.env.HOST.replace(/https?:\/\//, "")
  : "localhost";

let hmrConfig: HmrOptions;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  // FRONTEND_PORT may be undefined; that's ok — HMR's port is optional
  hmrConfig = {
    protocol: "wss",
    host,
    port: FRONTEND_PORT,
    clientPort: 443,
  };
}

export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    host: "localhost",
    port: FRONTEND_PORT, // number | undefined
    hmr: hmrConfig,
    proxy: {
      "^/(\\?.*)?$": proxyOptions,
      "^/api(/|(\\?.*)?$)": proxyOptions,
    },
  },
});
