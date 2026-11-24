import { api } from "@/lib/api";

export async function GET() {
  return Response.json(await api("/directory/open-data/"), {
    headers: {
      "Content-Disposition": 'attachment; filename="kanto62-davao-osm.json"',
    },
  });
}
