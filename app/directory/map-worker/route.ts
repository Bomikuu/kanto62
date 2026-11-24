import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-static";

export async function GET() {
  // MapLibre's worker must keep its own URL when Next bundles the client module.
  const worker = await readFile(
    join(process.cwd(), "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs"),
    "utf8",
  );
  return new Response(worker, {
    headers: { "Content-Type": "text/javascript; charset=utf-8" },
  });
}
