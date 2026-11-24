import "server-only";
import * as oidc from "openid-client";
import { createClient } from "redis";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const origin = () =>
  new URL(process.env.KANTO62_WEB_ORIGIN || "http://localhost:3063").origin;
export const callback = () => origin() + "/auth/callback";
export const configured = () =>
  Boolean(
    process.env.KANTO62_OIDC_ISSUER && process.env.KANTO62_OIDC_CLIENT_SECRET,
  );
export const googleEnabled = () =>
  configured() && process.env.KANTO62_GOOGLE_ENABLED === "1";
export const pilotEnabled = () =>
  configured() && process.env.KANTO62_BROKER_PILOT === "1";
export const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: origin().startsWith("https:"),
  path: "/",
});
let discovery: Promise<oidc.Configuration> | undefined;
export function broker() {
  if (!configured()) throw Error("Studio identity unavailable");
  const issuer = new URL(process.env.KANTO62_OIDC_ISSUER!);
  const local =
    issuer.protocol === "http:" &&
    ["localhost", "127.0.0.1"].includes(issuer.hostname) &&
    pilotEnabled();
  discovery ??= oidc
    .discovery(
      issuer,
      process.env.KANTO62_OIDC_CLIENT_ID!,
      process.env.KANTO62_OIDC_CLIENT_SECRET!,
      undefined,
      {
        execute: local
          ? [oidc.allowInsecureRequests, oidc.enableNonRepudiationChecks]
          : [oidc.enableNonRepudiationChecks],
      },
    )
    .catch((e) => {
      discovery = undefined;
      throw e;
    });
  return discovery;
}
let connection: ReturnType<typeof connect> | undefined;
async function connect() {
  const client = createClient({
    url: process.env.KANTO62_SESSION_REDIS_URL || "redis://127.0.0.1:56362/2",
    socket: { connectTimeout: 3000, reconnectStrategy: false },
  });
  client.on("error", () => {});
  await client.connect();
  return client;
}
async function db() {
  return (connection ??= connect().catch((e) => {
    connection = undefined;
    throw e;
  }));
}
type Transaction = { state: string; nonce: string; verifier: string };
export async function begin(google: boolean) {
  const cfg = await broker();
  const tx: Transaction = {
    state: oidc.randomState(),
    nonce: oidc.randomNonce(),
    verifier: oidc.randomPKCECodeVerifier(),
  };
  const id = randomBytes(32).toString("hex");
  await (await db()).set("k62:tx:" + id, JSON.stringify(tx), { EX: 300 });
  (await cookies()).set("k62oidctx", id, { ...cookieOptions(), maxAge: 300 });
  return oidc.buildAuthorizationUrl(cfg, {
    scope: "openid profile email",
    response_type: "code",
    redirect_uri: callback(),
    state: tx.state,
    nonce: tx.nonce,
    code_challenge: await oidc.calculatePKCECodeChallenge(tx.verifier),
    code_challenge_method: "S256",
    ...(google ? { kc_idp_hint: "google" } : {}),
  });
}
export async function complete(search: string) {
  const jar = await cookies();
  const id = jar.get("k62oidctx")?.value;
  jar.delete("k62oidctx");
  if (!id) throw Error("Sign-in expired");
  const cache = await db();
  const raw = await cache.getDel("k62:tx:" + id);
  if (!raw) throw Error("Sign-in expired");
  const tx: Transaction = JSON.parse(raw);
  const token = await oidc.authorizationCodeGrant(
    await broker(),
    new URL(callback() + search),
    {
      expectedNonce: tx.nonce,
      expectedState: tx.state,
      pkceCodeVerifier: tx.verifier,
      idTokenExpected: true,
    },
  );
  if (!token.access_token || !token.id_token)
    throw Error("Session unavailable");
  await forgetSession();
  const session = randomBytes(32).toString("hex");
  const ttl = Math.min(token.expires_in || 300, 3600);
  await cache.set(
    "k62:oidc:" + session,
    JSON.stringify({ access: token.access_token, idToken: token.id_token }),
    { EX: ttl },
  );
  jar.delete("k62merchant");
  jar.set("k62oidc", session, { ...cookieOptions(), maxAge: ttl });
}
export async function currentSession(): Promise<{
  access: string;
  idToken: string;
} | null> {
  const id = (await cookies()).get("k62oidc")?.value;
  if (!id) return null;
  const raw = await (await db()).get("k62:oidc:" + id);
  return raw ? JSON.parse(raw) : null;
}
export async function forgetSession() {
  const jar = await cookies();
  const id = jar.get("k62oidc")?.value;
  if (id) await (await db()).del("k62:oidc:" + id);
  jar.delete("k62oidc");
}
export async function endStudioSession() {
  const s = await currentSession();
  const config = await broker();
  await forgetSession();
  (await cookies()).delete("k62merchant");
  return oidc.buildEndSessionUrl(config, {
    ...(s ? { id_token_hint: s.idToken } : {}),
    client_id: process.env.KANTO62_OIDC_CLIENT_ID!,
    post_logout_redirect_uri: origin() + "/merchant",
  });
}
