/**
 * Local-only storage for /super-admin.
 * Reads and writes src/data/*.json through the dev-server endpoint in vite.config.ts,
 * so it only works while `npm run dev` is running. Commit and push the changed files yourself.
 */

export type DataFile = "areasOfWork.json" | "knowledge.json";

export async function loadFile<T>(file: DataFile): Promise<T> {
  const res = await fetch(`/__admin/data/${file}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not read src/data/${file}`);
  return res.json();
}

export async function saveFile<T>(file: DataFile, data: T): Promise<void> {
  const res = await fetch(`/__admin/data/${file}`, {
    method: "PUT",
    body: JSON.stringify(data, null, 2) + "\n",
  });
  if (!res.ok) throw new Error(`Could not write src/data/${file}: ${await res.text()}`);
}
