"use server";
import { cookies } from "next/headers";
import { api, ApiError } from "@/lib/api";

export type PreviewState = {
  description?: string;
  hours?: string;
  landmark?: string;
  error?: string;
};
export async function previewDraft(
  slug: string,
  _state: PreviewState,
): Promise<PreviewState> {
  const resume = (await cookies()).get("k62intake")?.value;
  if (!resume)
    return { error: "Complete contact verification for this listing first." };
  try {
    return await api(
      "/businesses/" + encodeURIComponent(slug) + "/qualified-preview/",
      { method: "POST", body: JSON.stringify({ resume }) },
      true,
    );
  } catch (error) {
    return {
      error:
        error instanceof ApiError
          ? error.message
          : "The preview is unavailable.",
    };
  }
}
