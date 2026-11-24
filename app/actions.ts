"use server";
import { cookies } from "next/headers";
import { forgetSession } from "@/lib/oidc";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api";
import type { Business, Slot } from "@/lib/types";
export type Outcome = {
  error?: string;
  message?: string;
  reference?: string;
  alternatives?: Slot[];
  startsAt?: string;
  partySize?: number;
  inquiry?: { item: string; quantity: number };
};
const val = (f: FormData, key: string) => String(f.get(key) ?? "").trim();
function failure(e: unknown): Outcome {
  return {
    alternatives: e instanceof ApiError ? e.alternatives : undefined,
    error:
      e instanceof ApiError
        ? e.message
        : "Connection interrupted. Please try again.",
  };
}
function endpoint(slug: string) {
  return "/businesses/" + encodeURIComponent(slug) + "/";
}
export async function enter(
  slug: string,
  needsClaim: boolean,
  _prior: Outcome,
  f: FormData,
): Promise<Outcome> {
  try {
    const login = await api<{ token: string }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({
        username: val(f, "username"),
        password: val(f, "password"),
      }),
    });
    if (needsClaim)
      await api(endpoint(slug) + "claim/", {
        method: "POST",
        headers: { Authorization: "Token " + login.token },
        body: JSON.stringify({ code: val(f, "code") }),
      });
    await api(endpoint(slug) + "draft/", {
      headers: { Authorization: "Token " + login.token },
    });
    await forgetSession();
    (await cookies()).set("k62merchant", login.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.KANTO62_HTTPS === "1",
      path: "/",
      maxAge: 3600,
    });
    revalidatePath("/businesses/" + slug);
    revalidatePath("/businesses/" + slug + "/manage");
    return { message: "Merchant access verified." };
  } catch (e) {
    return failure(e);
  }
}
export async function signOut() {
  await forgetSession();
  (await cookies()).delete("k62merchant");
  revalidatePath("/", "layout");
}
export async function restore(
  slug: string,
  _previous: Outcome,
  f: FormData,
): Promise<Outcome> {
  try {
    await api(
      endpoint(slug) + "restore/",
      {
        method: "POST",
        body: JSON.stringify({ revision_id: val(f, "revision_id") }),
      },
      true,
    );
    revalidatePath("/businesses/" + slug + "/manage");
  } catch (e) {
    return failure(e);
  }
  redirect(
    "/businesses/" +
      encodeURIComponent(slug) +
      "/manage?restored=" +
      crypto.randomUUID(),
  );
}
export async function edit(
  slug: string,
  _previous: Outcome,
  f: FormData,
): Promise<Outcome> {
  try {
    const base = endpoint(slug);
    const publish = f.get("intent") === "publish";
    await api(
      base + (publish ? "publish/" : "draft/"),
      {
        method: publish ? "POST" : "PATCH",
        body: JSON.stringify({
          description: val(f, "description"),
          hours: val(f, "hours"),
          landmark: val(f, "landmark"),
        }),
      },
      true,
    );
    if (publish) {
      revalidatePath("/businesses/" + slug);
      revalidatePath("/businesses/" + slug + "/manage");
      revalidatePath("/directory");
      return { message: "Storefront published." };
    }
    return { message: "Draft saved." };
  } catch (e) {
    return failure(e);
  }
}
export async function requestVisit(
  slug: string,
  stock: boolean,
  _previous: Outcome,
  f: FormData,
): Promise<Outcome> {
  const shared = {
    guest_name: val(f, "guest_name"),
    reply_channel: val(f, "reply_channel"),
    reply_to: val(f, "reply_to"),
  };
  const inquiry = stock
    ? { item: val(f, "item"), quantity: Number(val(f, "quantity")) }
    : undefined;
  const details = inquiry ?? {
    slot_id: val(f, "slot_id"),
    party_size: Number(val(f, "party_size")),
  };
  try {
    const result = await api<{
      id: string;
      starts_at?: string;
      party_size?: number;
    }>(endpoint(slug) + (stock ? "inquiries/" : "bookings/"), {
      method: "POST",
      headers: { "Idempotency-Key": val(f, "request_id") },
      body: JSON.stringify({ ...shared, ...details }),
    });
    return {
      message: stock ? "Stock inquiry received" : "Booking confirmed",
      reference: String(result.id),
      startsAt: result.starts_at,
      partySize: result.party_size,
      inquiry,
    };
  } catch (e) {
    return failure(e);
  }
}
