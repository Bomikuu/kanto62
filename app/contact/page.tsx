import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
export const metadata = {
  title: "Contact the studio",
  description:
    "Book a studio demo or ask the kanto62 team to review a business listing.",
  alternates: { canonical: "/contact" },
};
export default function Contact() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 sm:px-8 py-6">
      <Card>
        <CardContent className="grid gap-3">
          <h1>Contact the studio</h1>
          <p>
            Tell us what your business needs and choose a time to speak with the
            studio.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-primary [&>a:hover]:underline">
            <Button asChild>
              <Link href="/#booking">Book a demo</Link>
            </Button>
            <Link href="/intake?goal=claim">Ask about a listing</Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
