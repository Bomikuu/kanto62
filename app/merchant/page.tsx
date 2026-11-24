import { NativeSelect } from "@/components/ui/native-select";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  Globe2,
  PencilLine,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { googleEnabled, pilotEnabled, currentSession } from "@/lib/oidc";
import { Button } from "@/components/ui/button";
import {
  AccessIllustration,
  MerchantFrame,
  MerchantHeading,
} from "@/components/merchant-frame";
import { launch } from "./actions";
import { WorkspaceAccount } from "@/components/workspace-account";
import { LinkAccount } from "./link";

export const metadata = {
  title: "Merchant workspace",
  robots: { index: false, follow: false },
};

type Session = {
  identity: string;
  username: string | null;
  branches: { slug: string; name: string; role: string }[];
};
type App = {
  id: string;
  name: string;
  state: "open" | "activate" | "request_demo" | "integration_pending";
};

function SignIn() {
  return (
    <form
      className="grid min-w-0 gap-4 [&>label]:grid [&>label]:gap-1.5 [&>label]:text-sm [&>label]:font-medium [&>[data-slot=button]]:justify-self-start w-full max-w-md"
      method="post"
      action="/auth/start"
    >
      {googleEnabled() ? (
        <Button name="provider" value="google">
          Continue with Google <ArrowRight size={16} aria-hidden="true" />
        </Button>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Google sign-in is awaiting studio configuration.
        </p>
      )}
      {pilotEnabled() && (
        <Button
          name="provider"
          value="pilot"
          variant={googleEnabled() ? "outline" : "default"}
        >
          Sign in to the pilot <ArrowRight size={16} aria-hidden="true" />
        </Button>
      )}
    </form>
  );
}
export default async function Merchant({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string; issue?: string }>;
}) {
  const { branch, issue } = await searchParams;
  const oidc = await currentSession();
  const jar = await cookies();
  let session: Session | undefined;
  let unavailable = false;
  if (oidc || jar.has("k62merchant")) {
    try {
      session = await api<Session>("/auth/session/", {}, true);
    } catch (error) {
      unavailable = !(error instanceof ApiError && error.status === 401);
    }
  }

  const active = branch
    ? session?.branches.find((b) => b.slug === branch)
    : session?.branches[0];
  let apps: App[] = [];
  if (active)
    try {
      apps = (
        await api<{ results: App[] }>(
          "/businesses/" + encodeURIComponent(active.slug) + "/apps/",
          {},
          true,
        )
      ).results;
    } catch {
      unavailable = true;
    }

  const alerts = (
    <>
      {issue && (
        <p
          className="rounded-lg border border-primary/25 bg-accent p-3 text-sm text-accent-foreground data-[tone=error]:border-destructive/30 data-[tone=error]:bg-destructive/8 data-[tone=error]:text-destructive"
          data-tone="error"
          role="alert"
        >
          {issue === "launch"
            ? "Access changed. Check your business and app access."
            : "Sign-in could not finish. Start a fresh sign-in below."}
        </p>
      )}
      {unavailable && (
        <p
          className="rounded-lg border border-primary/25 bg-accent p-3 text-sm text-accent-foreground data-[tone=error]:border-destructive/30 data-[tone=error]:bg-destructive/8 data-[tone=error]:text-destructive"
          data-tone="error"
          role="alert"
        >
          The merchant service is unavailable. Reload to try again.
        </p>
      )}
    </>
  );
  if (!session || session.identity === "unlinked")
    return (
      <MerchantFrame>
        <div className="grid overflow-hidden rounded-2xl border bg-card lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid content-start justify-items-start gap-5 p-5 sm:p-8 lg:p-9 [&_form]:w-full [&>h2]:text-xl [&>h2]:font-semibold">
            <MerchantHeading title="Merchant workspace">
              <p>
                Manage your storefront, visits, and the studio apps connected to
                your business.
              </p>
            </MerchantHeading>
            {alerts}
            {session ? (
              <>
                <h2>Connect your merchant account</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Verify the merchant account you own to connect it to your
                  studio sign-in.
                </p>
                <LinkAccount />
                <WorkspaceAccount
                  username={session.username}
                  studio={Boolean(oidc)}
                />
              </>
            ) : (
              <SignIn />
            )}
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              href="/intake?goal=claim"
            >
              Find or claim my listing{" "}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <AccessIllustration />
        </div>
      </MerchantFrame>
    );

  if (!active)
    return (
      <MerchantFrame>
        <div className="grid overflow-hidden rounded-2xl border bg-card lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid content-start justify-items-start gap-5 p-5 sm:p-8 lg:p-9 [&_form]:w-full [&>h2]:text-xl [&>h2]:font-semibold">
            <MerchantHeading title="Merchant workspace" />
            {alerts}
            {branch && session.branches.length ? (
              <>
                <h2>This business is unavailable</h2>
                <Link href="/merchant">Return to your businesses</Link>
              </>
            ) : (
              <>
                <h2>Claim a listing to get started</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Find the business you own before requesting access.
                </p>
                <Button asChild>
                  <Link href="/directory">
                    Browse the directory{" "}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </Button>
              </>
            )}
            <WorkspaceAccount
              username={session.username}
              studio={Boolean(oidc)}
            />
          </div>
          <AccessIllustration />
        </div>
      </MerchantFrame>
    );

  const site = "/businesses/" + active.slug;
  const manage = "/merchant/" + active.slug;
  return (
    <MerchantFrame
      context={active}
      current="overview"
      account={
        <WorkspaceAccount username={session.username} studio={Boolean(oidc)} />
      }
      railControls={
        session.branches.length > 1 && (
          <form className="grid min-w-0 gap-4 [&>label]:grid [&>label]:gap-1.5 [&>label]:text-sm [&>label]:font-medium [&>[data-slot=button]]:justify-self-start border-b p-3">
            <label>
              Business
              <NativeSelect name="branch" defaultValue={active.slug}>
                {session.branches.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </NativeSelect>
            </label>
            <Button variant="outline">Switch business</Button>
          </form>
        )
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <MerchantHeading title="Merchant workspace">
          <p>{active.name}</p>
        </MerchantHeading>
      </div>
      {alerts}
      {active.role === "owner" && (
        <section className="grid min-w-0 gap-4 rounded-xl border bg-card p-4 sm:p-5 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:tracking-tight">
          <h2>Manage your business</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 [&>a]:grid [&>a]:gap-1.5 [&>a]:rounded-lg [&>a]:border [&>a]:p-4 [&>a>svg]:mb-1 [&>a>svg]:text-primary hover:[&>a]:bg-muted [&_small]:text-muted-foreground">
            {(
              [
                [
                  "Edit storefront",
                  "Draft, preview, and publish your business details.",
                  site + "/manage",
                  PencilLine,
                ],
                [
                  "Plans & domains",
                  "Manage your subscription and connect a hostname.",
                  manage + "/billing",
                  CreditCard,
                ],
                [
                  "Bookings & inquiries",
                  "Review guest requests for this business.",
                  manage + "/requests",
                  CalendarDays,
                ],
              ] as const
            ).map(([label, description, href, Icon]) => (
              <Link href={href} key={label}>
                <Icon size={19} strokeWidth={1.65} aria-hidden="true" />
                <div>
                  <strong>{label}</strong>
                  <p>{description}</p>
                </div>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      )}
      <section className="grid min-w-0 gap-4 rounded-xl border bg-card p-4 sm:p-5 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:tracking-tight">
        <h2>Apps for {active.name}</h2>
        {!oidc && (
          <div className="grid justify-items-start gap-3 text-sm text-muted-foreground">
            <p>Use your studio account to open connected apps.</p>
            <SignIn />
          </div>
        )}
        {apps.length > 0 ? (
          <ul className="grid divide-y [&>li]:flex [&>li]:flex-wrap [&>li]:items-center [&>li]:justify-between [&>li]:gap-3 [&>li]:py-3 [&_p]:mt-1 [&_p]:text-sm [&_p]:text-muted-foreground">
            {apps.map((a) => (
              <li key={a.id}>
                <span>
                  <Globe2 size={17} strokeWidth={1.65} aria-hidden="true" />{" "}
                  <strong>{a.name}</strong>
                </span>
                {a.state === "open" && oidc ? (
                  <form action={launch.bind(null, active.slug, a.id)}>
                    <Button variant="outline">
                      Open {a.name} <ArrowRight size={15} aria-hidden="true" />
                    </Button>
                  </form>
                ) : (
                  <small>
                    {
                      {
                        activate: "Activation required",
                        request_demo: "Available by request",
                        integration_pending: "Integration pending",
                        open: "Studio sign-in required",
                      }[a.state]
                    }
                  </small>
                )}
              </li>
            ))}
          </ul>
        ) : (
          !unavailable && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Connected apps will appear here when available.
            </p>
          )
        )}
      </section>
    </MerchantFrame>
  );
}
