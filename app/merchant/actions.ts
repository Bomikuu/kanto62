"use server";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { currentSession, endStudioSession } from "@/lib/oidc";
export async function linkAccount(_prev: string, f: FormData) {
  if (!(await currentSession()))
    return "Sign in with the studio account again.";
  try {
    await api(
      "/auth/link/",
      {
        method: "POST",
        body: JSON.stringify({
          username: f.get("username"),
          password: f.get("password"),
        }),
      },
      true,
    );
  } catch (e) {
    return e instanceof ApiError
      ? e.message
      : "Linking is unavailable. Try again.";
  }
  redirect("/merchant");
}
export async function launch(branch: string, app: string) {
  let url: string;
  try {
    ({ url } = await api<{ url: string }>(
      "/businesses/" +
        encodeURIComponent(branch) +
        "/apps/" +
        encodeURIComponent(app) +
        "/launch/",
      { method: "POST", body: "{}" },
      true,
    ));
  } catch {
    redirect("/merchant?issue=launch");
  }
  redirect(url);
}
export async function globalLogout() {
  const url = await endStudioSession();
  redirect(url.toString());
}
