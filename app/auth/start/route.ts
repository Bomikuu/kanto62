import { NextRequest, NextResponse } from "next/server";
import { begin, googleEnabled, pilotEnabled, origin } from "@/lib/oidc";
export async function POST(req: NextRequest) {
  if (req.headers.get("origin") !== origin())
    return new Response("Invalid sign-in origin", { status: 403 });
  const google = (await req.formData()).get("provider") === "google";
  if (!(google ? googleEnabled() : pilotEnabled()))
    return NextResponse.redirect(
      origin() + "/merchant?issue=configuration",
      303,
    );
  try {
    return NextResponse.redirect(await begin(google), 303);
  } catch {
    return NextResponse.redirect(origin() + "/merchant?issue=provider", 303);
  }
}
