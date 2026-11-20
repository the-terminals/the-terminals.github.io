import { defineConfig, type Plugin } from "vite";
import fs from "fs";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Dev-only endpoint used by /super-admin to read and write src/data/*.json
const ADMIN_FILES = ["areasOfWork.json", "knowledge.json"];
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
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

    // Book cover images: list (GET) and upload (POST ?name=file.jpg, raw bytes) into public/images/books
    server.middlewares.use("/__admin/images", (req, res, next) => {
      const dir = path.resolve(__dirname, "public/images/books");
      const send = (status: number, body: unknown) => {
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify(body));
      };
      if (req.method === "GET") {
        const files = fs.existsSync(dir)
          ? fs.readdirSync(dir).filter((f) => IMAGE_EXT.test(f)).sort()
          : [];
        return send(200, files.map((f) => `/images/books/${f}`));
      }
      if (req.method === "POST") {
        const url = new URL(req.url || "", "http://localhost");
        const original = (url.searchParams.get("name") || "cover.jpg").toLowerCase();
        const ext = (original.match(IMAGE_EXT)?.[0] || ".jpg").replace(".jpeg", ".jpg");
        const base =
          original
            .replace(IMAGE_EXT, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 50) || "cover";
        fs.mkdirSync(dir, { recursive: true });
        let name = `${base}${ext}`;
        for (let i = 1; fs.existsSync(path.join(dir, name)); i++) name = `${base}-${i}${ext}`;

        const chunks: Buffer[] = [];
        let size = 0;
        req.on("data", (c: Buffer) => {
          size += c.length;
          chunks.push(c);
        });
        req.on("end", () => {
          if (size === 0) return send(400, { error: "Empty file" });
          if (size > MAX_IMAGE_BYTES) return send(413, { error: "Image is larger than 5 MB" });
          fs.writeFileSync(path.join(dir, name), Buffer.concat(chunks));
          send(200, { path: `/images/books/${name}` });
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
