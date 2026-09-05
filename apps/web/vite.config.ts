import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isVercel =
  process.env.VERCEL === "1";

export default defineConfig({
  plugins: [
    react()
  ],
  build: {
    outDir:
      isVercel
        ? "../../dist"
        : "dist",
    emptyOutDir: true
  }
});
