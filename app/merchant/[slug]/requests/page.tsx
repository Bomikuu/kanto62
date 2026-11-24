import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { business } from "@/lib/business";
import { Button } from "@/components/ui/button";
import { MerchantFrame, MerchantHeading } from "@/components/merchant-frame";

export const metadata = {
  title: "Merchant requests",
  robots: { index: false, follow: false },
};
type Request = {
  id: string;
  status: string;
  guest_name: string;
  reply_channel: string;
  reply_to: string;
  starts_at?: string;
  item?: string;
  quantity?: number;
  party_size?: number;
};

export default async function Requests({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let data: { bookings: Request[]; inquiries: Request[] };
  try {
    data = await api(
      "/businesses/" + encodeURIComponent(slug) + "/requests/",
      {},
      true,
    );
  } catch (error) {
    if (!(error instanceof ApiError) || ![401, 403, 404].includes(error.status))
      throw error;
    return (
      <MerchantFrame back={{ href: "/merchant", label: "Merchant workspace" }}>
        <MerchantHeading title="Bookings and inquiries">
          <p>Sign in as the verified listing owner.</p>
        </MerchantHeading>
        <Button asChild>
          <Link href="/merchant">Go to merchant workspace</Link>
        </Button>
      </MerchantFrame>
    );
  }
  const listing = await business(slug);
  const format = new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  });
  return (
    <MerchantFrame
      context={{ slug, name: listing.name, role: "owner" }}
      current="requests"
      back={{
        href: "/merchant?branch=" + encodeURIComponent(slug),
        label: "Overview",
      }}
    >
      <MerchantHeading title="Bookings and inquiries">
        <p>{listing.name}</p>
      </MerchantHeading>
      <section className="grid min-w-0 gap-4 rounded-xl border bg-card p-4 sm:p-5 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:tracking-tight">
        <h2>Bookings</h2>
        {!data.bookings.length && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            No bookings yet.
          </p>
        )}
        <ul className="divide-y [&>li]:flex [&>li]:flex-wrap [&>li]:items-center [&>li]:justify-between [&>li]:gap-3 [&>li]:py-3 [&_p]:text-sm [&_p]:text-muted-foreground">
          {data.bookings.map((row) => (
            <li key={row.id}>
              <div>
                <strong>{row.guest_name}</strong>
                <p>
                  {row.reply_to} · {row.reply_channel}
                </p>
                {row.starts_at && (
                  <p>
                    <time dateTime={row.starts_at}>
                      {format.format(new Date(row.starts_at))}
                    </time>{" "}
                    PHT
                    {row.party_size != null && " · Party of " + row.party_size}
                  </p>
                )}
              </div>
              <span className="inline-flex w-fit items-center rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                {row.status}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="grid min-w-0 gap-4 rounded-xl border bg-card p-4 sm:p-5 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:tracking-tight">
        <h2>Stock inquiries</h2>
        {!data.inquiries.length && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            No stock inquiries yet.
          </p>
        )}
        <ul className="divide-y [&>li]:flex [&>li]:flex-wrap [&>li]:items-center [&>li]:justify-between [&>li]:gap-3 [&>li]:py-3 [&_p]:text-sm [&_p]:text-muted-foreground">
          {data.inquiries.map((row) => (
            <li key={row.id}>
              <div>
                <strong>{row.guest_name}</strong>
                <p>
                  {row.reply_to} · {row.reply_channel}
                </p>
                <p>
                  {row.quantity} × {row.item}
                </p>
              </div>
              <span className="inline-flex w-fit items-center rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                {row.status}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </MerchantFrame>
  );
}
