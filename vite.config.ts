import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // GitHub Pages sets GITHUB_REPOSITORY=owner/repo in Actions.
  // This makes the build work automatically for any repo name without hardcoding.
  const repo = process.env.GITHUB_REPOSITORY?.split("/")?.[1];
  const base =
    mode === "production" ? (repo ? `/${repo}/` : "/") : "/";

  return {
    base,
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

