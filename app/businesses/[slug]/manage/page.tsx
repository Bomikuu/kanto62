import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, History } from "lucide-react";
import { business } from "@/lib/business";
import { api, ApiError } from "@/lib/api";
import { Editor, Login, type Draft } from "@/components/forms";
import { signOut } from "@/app/actions";
import {
  AccessIllustration,
  MerchantFrame,
  MerchantHeading,
} from "@/components/merchant-frame";
import { RevisionPicker, type Revision } from "@/components/revisions";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Storefront editor",
  robots: { index: false, follow: false },
};

export default async function Manage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ restored?: string }>;
}) {
  const { restored } = await searchParams;
  const listing = await business((await params).slug);
  const root = "/businesses/" + listing.slug;
  const back = { href: root, label: listing.name };
  const jar = await cookies();
  let draft: Draft | undefined;
  let revisions: Revision[] = [];
  if (jar.has("k62merchant") || jar.has("k62oidc")) {
    try {
      draft = await api<Draft>(root + "/draft/", {}, true);
      revisions = (
        await api<{ results: Revision[] }>(root + "/revisions/", {}, true)
      ).results;
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        ![401, 403, 404].includes(error.status)
      )
        throw error;
    }
  }

  if (!draft) {
    const claim = listing.ownership_status === "unclaimed";
    return (
      <MerchantFrame back={back}>
        <div className="grid overflow-hidden rounded-2xl border bg-card lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid content-start justify-items-start gap-5 p-5 sm:p-8 lg:p-9 [&_form]:w-full [&>h2]:text-xl [&>h2]:font-semibold">
            <MerchantHeading
              title={claim ? "Claim your listing" : "Merchant sign-in"}
            >
              <p>
                {[listing.name, listing.barangay || listing.city].join(" · ")}
              </p>
            </MerchantHeading>
            {listing.is_fixture ? (
              <>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {claim
                    ? "Enter the merchant credentials and the verification code for this sample business."
                    : "Sign in with the owner account for this sample business."}
                </p>
                <Login b={listing} />
              </>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {claim
                    ? "Start with contact verification. The studio reviews ownership before handing over the storefront."
                    : "Sign in with the studio account linked to this business."}
                </p>
                <Button asChild>
                  <Link
                    href={
                      claim
                        ? "/intake?goal=claim&q=" +
                          encodeURIComponent(listing.name)
                        : "/merchant"
                    }
                  >
                    {claim
                      ? "Start ownership review"
                      : "Go to merchant sign-in"}{" "}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </Button>
              </>
            )}
          </div>
          <AccessIllustration />
        </div>
      </MerchantFrame>
    );
  }

  return (
    <MerchantFrame
      context={{ slug: listing.slug, name: listing.name, role: "owner" }}
      current="editor"
      back={back}
    >
      <MerchantHeading title="Edit storefront">
        <p>Update the details residents see when they open your listing.</p>
      </MerchantHeading>
      {restored && (
        <p
          className="rounded-lg border border-primary/25 bg-accent p-3 text-sm text-accent-foreground data-[tone=error]:border-destructive/30 data-[tone=error]:bg-destructive/8 data-[tone=error]:text-destructive"
          role="status"
        >
          Revision restored to draft. Review it before publishing.
        </p>
      )}
      <Editor key={restored || listing.slug} b={listing} draft={draft} />
      <section className="grid min-w-0 gap-4 rounded-xl border bg-card p-4 sm:p-5 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:tracking-tight [&_form]:justify-items-start">
        <div>
          <h2>
            <History size={20} strokeWidth={1.65} aria-hidden="true" />{" "}
            Published revisions
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Restore a previous version to your private draft before publishing
            it.
          </p>
        </div>
        {revisions.length > 0 ? (
          <RevisionPicker slug={listing.slug} revisions={revisions} />
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your first published version will appear here.
          </p>
        )}
      </section>
      <div className="flex flex-wrap items-center gap-2 pb-4">
        {jar.has("k62intake") && (
          <Button asChild variant="outline">
            <Link href={root + "/preview"}>
              <ClipboardCheck size={16} aria-hidden="true" /> Verify storefront
              setup
            </Link>
          </Button>
        )}
        <form action={signOut}>
          <Button variant="outline">Sign out</Button>
        </form>
      </div>
    </MerchantFrame>
  );
}
