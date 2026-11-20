import { defineConfig, type Plugin } from "vite";
import fs from "fs";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Dev-only endpoint used by /super-admin to read and write src/data/*.json
const ADMIN_FILES = ["areasOfWork.json", "knowledge.json"];
const localAdminApi = (): Plugin => ({
  name: "local-admin-api",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use("/__admin/data", (req, res, next) => {
      const file = decodeURIComponent((req.url || "").split("?")[0].replace(/^\//, ""));
      if (!ADMIN_FILES.includes(file)) {
        res.statusCode = 404;
        return res.end("Unknown file");
      }
      const filePath = path.resolve(__dirname, "src/data", file);
      if (req.method === "GET") {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        return res.end(fs.readFileSync(filePath));
      }
      if (req.method === "PUT") {
        const chunks: Buffer[] = [];
        req.on("data", (c: Buffer) => chunks.push(c));
        req.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          try {
            JSON.parse(body);
            fs.writeFileSync(filePath, body, "utf8");
            res.end('{"ok":true}');
          } catch (e) {
            res.statusCode = 400;
            res.end(String(e));
          }
        });
        return;
      }
      next();
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), localAdminApi(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
