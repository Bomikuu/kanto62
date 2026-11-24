import { MerchantFrame, MerchantHeading } from "@/components/merchant-frame";
import { Preview } from "./form";
export const metadata = {
  title: "Private storefront preview",
  robots: { index: false, follow: false },
};
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <MerchantFrame
      back={{
        href: "/businesses/" + slug + "/manage",
        label: "Storefront editor",
      }}
    >
      <MerchantHeading title="Verify storefront setup">
        <p>
          Open your saved draft after verifying your contact for this listing.
        </p>
      </MerchantHeading>
      <Preview slug={slug} />
    </MerchantFrame>
  );
}
