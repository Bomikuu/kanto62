"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";

const cookieName = "k62intake";

export async function intakeAction(_previous: string, data: FormData) {
  let next = false;
  try {
    const jar = await cookies();
    const values = Object.fromEntries(data);
    const operation = data.get("action");
    if (operation === "new") {
      jar.delete(cookieName);
      next = true;
    } else if (operation === "start") {
      const draft = await api<{ resume: string }>("/intake/", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          needs: data.getAll("needs"),
          marketing: data.has("marketing"),
        }),
      });
      jar.set(cookieName, draft.resume, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.KANTO62_HTTPS === "1",
        path: "/",
        maxAge: 30 * 86400,
      });
      next = true;
    } else {
      const ref = jar.get(cookieName)?.value;
      if (!ref) return "Start a signup to continue.";
      await api("/intake/draft/", {
        method: "POST",
        headers: { "X-Kanto62-Intake": ref },
        body: JSON.stringify(values),
      });
      revalidatePath("/intake");
      return operation === "resend" || operation === "change_destination"
        ? "A new verification code was requested."
        : "";
    }
  } catch (error) {
    return error instanceof ApiError
      ? error.message
      : "The signup service is unavailable. Try again shortly.";
  }
  if (next) redirect("/intake");
  return "";
}
