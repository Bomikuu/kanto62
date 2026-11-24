import "server-only";
import { cookies } from "next/headers";
import { currentSession } from "./oidc";
import type { Slot } from "./types";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public alternatives?: Slot[],
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  init: RequestInit = {},
  privateRequest = false,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  if (privateRequest) {
    const session = (await cookies()).get("k62merchant");
    const oidc = await currentSession();
    if (oidc) headers.set("Authorization", "Bearer " + oidc.access);
    else if (session) headers.set("Authorization", "Token " + session.value);
  }
  const response = await fetch(
    (process.env.KANTO62_API_URL || "http://127.0.0.1:8000/api/v1") + path,
    {
      ...init,
      headers,
      cache: "no-store",
      signal: init.signal ?? AbortSignal.timeout(12000),
    },
  );
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const first = body && Object.values(body)[0];
    throw new ApiError(
      response.status,
      String(
        body?.detail ||
          body?.message ||
          (Array.isArray(body) && body.join(" ")) ||
          (Array.isArray(first)
            ? first.join(" ")
            : "Please check your details and try again."),
      ),
      Array.isArray(body?.alternatives) ? body.alternatives : undefined,
    );
  }
  return body;
}
