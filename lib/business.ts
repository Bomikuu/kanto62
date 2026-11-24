import { notFound } from "next/navigation";
import { cache } from "react";
import { api, ApiError } from "./api";
import type { Business } from "./types";
export const business = cache(async (slug: string) => {
  try {
    return await api<Business>("/businesses/" + encodeURIComponent(slug) + "/");
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
});
