"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api";
import { forgetSession } from "@/lib/oidc";
import type { Match } from "./types";

export type StudioResult = {
  message?: string;
  ok?: boolean;
  prospect?: number;
  matches?: Match[];
  mode?: string;
};

export async function studioAction(
  section: string,
  _previous: StudioResult,
  data: FormData,
): Promise<StudioResult> {
  try {
    const input = Object.fromEntries(data);
    if (section === "login") {
      const result = await api<{ token: string }>("/auth/login/", {
        method: "POST",
        body: JSON.stringify(input),
      });
      await api("/studio/report/", {
        headers: { Authorization: "Token " + result.token },
      });
      await forgetSession();
      (await cookies()).set("k62merchant", result.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.KANTO62_HTTPS === "1",
        path: "/",
        maxAge: 3600,
      });
    } else {
      const response = await api<{
        results?: Match[];
        mode?: string;
        id?: number;
      }>(
        "/studio/" + section + "/",
        { method: "POST", body: JSON.stringify(input) },
        true,
      );
      if (section === "recommend")
        return { matches: response.results, mode: response.mode };
      revalidatePath("/studio", "layout");
      return {
        ok: true,
        prospect: input.action === "save" ? response.id : undefined,
        message:
          section === "contacts"
            ? "Contact opted out."
            : section === "intakes"
              ? "Listing published."
              : input.action === "save"
                ? "Prospect saved."
                : "Changes saved.",
      };
    }
  } catch (error) {
    return {
      message:
        error instanceof ApiError
          ? error.message
          : "The sales workspace is unavailable. Try again shortly.",
    };
  }
  redirect("/studio/prospects");
}
