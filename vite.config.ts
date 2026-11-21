import { defineConfig, type Connect, type Plugin } from "vite";
import fs from "fs";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { fetchPlaylist, PlaylistError } from "./server/youtubePlaylist";

// Dev-only endpoint used by /super-admin to read and write src/data/*.json
const ADMIN_FILES = ["areasOfWork.json", "knowledge.json", "playlists.json"];
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;
const PDF_EXT = /\.pdf$/i;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BYTES = 50 * 1024 * 1024;

/**
 * Dev-only upload endpoint used by /super-admin.
 * GET lists the files already stored in `dir`; POST saves the raw request body
 * under a sanitised name and answers with the public path to store in src/data/*.json.
 */
const uploadEndpoint = ({
  dir,
  publicPath,
  ext,
  fallbackExt,
  fallbackName,
  noun,
  maxBytes,
  maxLabel,
}: {
  dir: string;
  publicPath: string;
  ext: RegExp;
  fallbackExt: string;
  fallbackName: string;
  noun: string;
  maxBytes: number;
  maxLabel: string;
}): Connect.NextHandleFunction => (req, res, next) => {
  const send = (status: number, body: unknown) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(body));
  };

  if (req.method === "GET") {
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => ext.test(f)).sort() : [];
    return send(200, files.map((f) => `${publicPath}/${f}`));
  }

  if (req.method === "POST") {
    const url = new URL(req.url || "", "http://localhost");
    const original = (url.searchParams.get("name") || "").toLowerCase();
    const extension = (original.match(ext)?.[0] || fallbackExt).replace(".jpeg", ".jpg");
    const base =
      original
        .replace(ext, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50) || fallbackName;

    fs.mkdirSync(dir, { recursive: true });
    let name = `${base}${extension}`;
    for (let i = 1; fs.existsSync(path.join(dir, name)); i++) name = `${base}-${i}${extension}`;

    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (c: Buffer) => {
      size += c.length;
      chunks.push(c);
    });
    req.on("end", () => {
      if (size === 0) return send(400, { error: "Empty file" });
      if (size > maxBytes) return send(413, { error: `${noun} is larger than ${maxLabel}` });
      fs.writeFileSync(path.join(dir, name), Buffer.concat(chunks));
      send(200, { path: `${publicPath}/${name}` });
    });
    return;
  }

  next();
};

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

    // Uploaded files: GET lists them, POST (?name=file.ext, raw bytes) saves one
    // and answers with the public path stored in src/data/knowledge.json.
    server.middlewares.use(
      "/__admin/images",
      uploadEndpoint({
        dir: path.resolve(__dirname, "public/images/books"),
        publicPath: "/images/books",
        ext: IMAGE_EXT,
        fallbackExt: ".jpg",
        fallbackName: "cover",
        noun: "Image",
        maxBytes: MAX_IMAGE_BYTES,
        maxLabel: "5 MB",
      }),
    );

    server.middlewares.use(
      "/__admin/pdfs",
      uploadEndpoint({
        dir: path.resolve(__dirname, "public/pdfs/books"),
        publicPath: "/pdfs/books",
        ext: PDF_EXT,
        fallbackExt: ".pdf",
        fallbackName: "book",
        noun: "PDF",
        maxBytes: MAX_PDF_BYTES,
        maxLabel: "50 MB",
      }),
    );

    // YouTube playlist lookup: POST {"url": "..."} -> { playlistId, title, videos[] }
    server.middlewares.use("/__admin/youtube-playlist", (req, res, next) => {
      if (req.method !== "POST") return next();
      const send = (status: number, body: unknown) => {
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify(body));
      };
      const chunks: Buffer[] = [];
      req.on("data", (c: Buffer) => chunks.push(c));
      req.on("end", async () => {
        try {
          const { url } = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
          send(200, await fetchPlaylist(url));
        } catch (e) {
          const message = e instanceof PlaylistError ? e.message : "Could not load this playlist.";
          if (!(e instanceof PlaylistError)) console.error("[youtube-playlist]", e);
          send(400, { error: message });
        }
      });
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
