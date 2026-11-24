import { NextRequest, NextResponse } from "next/server";
import { complete, origin } from "@/lib/oidc";
export async function GET(req: NextRequest) {
  let path = "/merchant";
  try {
    await complete(req.nextUrl.search);
  } catch {
    path += "?issue=callback";
  }
  const res = NextResponse.redirect(origin() + path, 303);
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}
