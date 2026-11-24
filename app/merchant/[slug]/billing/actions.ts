"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api";
export type BillingFeedback = { message?: string; error?: string };

export async function changeBilling(
  slug: string,
  _previous: BillingFeedback,
  f: FormData,
): Promise<BillingFeedback> {
  const action = String(f.get("action") || "");
  let url: string | undefined;
  try {
    const result = await api<{ checkout_url?: string }>(
      "/businesses/" + encodeURIComponent(slug) + "/billing/",
      {
        method: "POST",
        body: JSON.stringify({
          action,
          plan: f.get("plan"),
          invoice: f.get("invoice"),
          hostname: f.get("hostname"),
        }),
      },
      true,
    );
    if (action === "checkout") url = result.checkout_url;
  } catch (e) {
    return {
      error:
        e instanceof ApiError
          ? e.message
          : "Could not reach billing. Retry this action.",
    };
  }
  revalidatePath("/merchant/" + slug + "/billing");
  if (url) redirect(url);
  return {
    message:
      (
        {
          verify:
            "DNS verification succeeded. Open the HTTPS storefront to complete activation.",
          connect: "Domain added. Publish both DNS records below.",
          refresh: "Payment status checked.",
          cancel: "Invoice updated.",
          disconnect: "Domain disconnected.",
          pilot_dns: "Records added to the pilot DNS zone. Verify DNS next.",
        } as Record<string, string>
      )[action] || "Saved.",
  };
}
