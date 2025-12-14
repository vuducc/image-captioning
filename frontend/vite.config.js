import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        "/api": {
          target: "https://backend-ss45.onrender.com",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
      },
    },
  };
});
